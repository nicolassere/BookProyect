import csv
import io
import json
import uuid
from datetime import date

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import AuthorProfile, Book, ReadingGoal
from schemas import BulkImportResponse, ImportRequest
from utils.helpers import book_to_dict, dict_to_book_kwargs

router = APIRouter()


# ─── Export endpoints ────────────────────────────────────────────────────────

@router.get("/json", summary="Download all books as JSON")
def export_json(db: Session = Depends(get_db)):
    books = db.query(Book).order_by(Book.date_finished.desc()).all()
    data = [book_to_dict(b) for b in books]
    content = json.dumps(data, ensure_ascii=False, indent=2)
    filename = f"book-readings-{date.today().isoformat()}.json"
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/csv", summary="Download all books as CSV")
def export_csv(db: Session = Depends(get_db)):
    books = db.query(Book).order_by(Book.date_finished.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Title", "Author", "Pages", "Genre", "Nationality",
        "Date Finished", "Rating", "Collections", "ISBN",
        "Year Published", "Notes", "Reading Type", "Favorite",
        "Cover URL", "Start Date", "Academic Field", "Academic Level",
    ])

    for b in books:
        collections = json.loads(b.collections or "[]")
        writer.writerow([
            b.title, b.author, b.pages, b.genre, b.nationality,
            b.date_finished, b.rating or "",
            ", ".join(collections),
            b.isbn or "", b.year_published or "", b.notes or "",
            b.reading_type or "",
            "Yes" if b.favorite else "No",
            b.cover_url or "", b.start_date or "",
            b.academic_field or "", b.academic_level or "",
        ])

    content = output.getvalue()
    filename = f"book-readings-{date.today().isoformat()}.csv"
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8-sig")),   # utf-8-sig for Excel BOM
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/backup", summary="Download full backup (books + authors + goals)")
def export_backup(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    profiles = db.query(AuthorProfile).all()
    goals = db.query(ReadingGoal).all()

    backup = {
        "version": "1.0",
        "exported_at": date.today().isoformat(),
        "readings": [book_to_dict(b) for b in books],
        "author_profiles": [
            {
                "name": p.name,
                "nationality": p.nationality,
                "primary_genre": p.primary_genre,
                "favorite_book": p.favorite_book,
                "bio": p.bio,
            }
            for p in profiles
        ],
        "reading_goals": [
            {"year": g.year, "target_books": g.target_books} for g in goals
        ],
    }

    content = json.dumps(backup, ensure_ascii=False, indent=2)
    filename = f"book-tracker-backup-{date.today().isoformat()}.json"
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─── Import endpoints ────────────────────────────────────────────────────────

@router.post("/import/json", response_model=BulkImportResponse)
def import_json(request: ImportRequest, db: Session = Depends(get_db)):
    """
    Import books (and optionally author profiles) from a JSON payload.
    Set replace=true to wipe existing books first.
    """
    if request.replace:
        db.query(Book).delete()
        db.commit()
        existing_keys: set = set()
    else:
        existing_books = db.query(Book.title, Book.author).all()
        existing_keys = {f"{b.title}|{b.author}" for b in existing_books}

    imported = 0
    skipped = 0

    for book_data in request.readings:
        key = f"{book_data.title}|{book_data.author}"
        if key in existing_keys:
            skipped += 1
            continue

        book_id = book_data.id or str(uuid.uuid4())
        # Avoid duplicate PK if the same id appears twice in the payload
        if db.query(Book).filter(Book.id == book_id).first():
            book_id = str(uuid.uuid4())

        db_book = Book(**dict_to_book_kwargs(book_data, book_id))
        db.add(db_book)
        existing_keys.add(key)
        imported += 1

    # Import author profiles if supplied
    if request.author_profiles:
        for pd in request.author_profiles:
            existing = db.query(AuthorProfile).filter(AuthorProfile.name == pd.name).first()
            if not existing:
                db.add(AuthorProfile(
                    name=pd.name,
                    nationality=pd.nationality,
                    primary_genre=pd.primary_genre,
                    favorite_book=pd.favorite_book,
                    bio=pd.bio,
                ))

    db.commit()
    return {
        "imported": imported,
        "skipped": skipped,
        "total": len(request.readings),
        "message": f"Imported {imported} books, skipped {skipped} duplicates.",
    }


@router.post("/import/goodreads", response_model=BulkImportResponse)
async def import_goodreads_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Parse a Goodreads CSV export and import books."""
    content = await file.read()
    text = content.decode("utf-8-sig")  # Handle BOM from Goodreads export

    reader = csv.DictReader(io.StringIO(text))

    existing_books = db.query(Book.title, Book.author).all()
    existing_keys = {f"{b.title}|{b.author}" for b in existing_books}

    imported = 0
    skipped = 0

    for row in reader:
        title = (row.get("Title") or "").strip()
        author = (row.get("Author") or "").strip()
        if not title or not author:
            continue

        key = f"{title}|{author}"
        if key in existing_keys:
            skipped += 1
            continue

        try:
            pages = int(row.get("Number of Pages") or 0) or 0
        except (ValueError, TypeError):
            pages = 0

        try:
            raw_rating = float(row.get("My Rating") or 0)
            rating: float | None = raw_rating if raw_rating > 0 else None
        except (ValueError, TypeError):
            rating = None

        try:
            year_published = int(row.get("Year Published") or 0) or None
        except (ValueError, TypeError):
            year_published = None

        date_finished = (row.get("Date Read") or "").strip() or date.today().isoformat()
        shelf = (row.get("Bookshelves") or "").strip() or "Unknown"
        isbn_raw = (row.get("ISBN13") or row.get("ISBN") or "").strip()
        isbn = isbn_raw.lstrip("=").strip('"') or None

        db_book = Book(
            id=str(uuid.uuid4()),
            title=title,
            author=author,
            pages=pages or 200,
            genre=shelf,
            nationality="Unknown",
            date_finished=date_finished,
            rating=rating,
            collections=json.dumps([]),
            isbn=isbn,
            year_published=year_published,
            notes=(row.get("My Review") or "").strip() or None,
            favorite=False,
        )
        db.add(db_book)
        existing_keys.add(key)
        imported += 1

    db.commit()
    return {
        "imported": imported,
        "skipped": skipped,
        "total": imported + skipped,
        "message": f"Imported {imported} books from Goodreads, skipped {skipped} duplicates.",
    }
