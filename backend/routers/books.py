import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Book
from schemas import BookCreate, BookResponse
from utils.helpers import book_to_dict, dict_to_book_kwargs

router = APIRouter()


@router.get("/", response_model=List[BookResponse])
def get_books(
    genre: Optional[str] = None,
    nationality: Optional[str] = None,
    reading_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Book)
    if genre:
        query = query.filter(Book.genre == genre)
    if nationality:
        query = query.filter(Book.nationality == nationality)
    if reading_type:
        query = query.filter(Book.reading_type == reading_type)

    books = query.order_by(Book.date_finished.desc()).all()
    return [book_to_dict(b) for b in books]


@router.post("/", response_model=BookResponse, status_code=201)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    book_id = book.id or str(uuid.uuid4())

    # Avoid duplicate IDs
    if db.query(Book).filter(Book.id == book_id).first():
        book_id = str(uuid.uuid4())

    db_book = Book(**dict_to_book_kwargs(book, book_id))
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return book_to_dict(db_book)


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book_to_dict(book)


@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: str, book: BookCreate, db: Session = Depends(get_db)):
    import json

    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    db_book.title = book.title
    db_book.author = book.author
    db_book.pages = book.pages
    db_book.genre = book.genre
    db_book.nationality = book.nationality
    db_book.date_finished = book.date_finished
    db_book.timestamp = book.timestamp
    db_book.rating = book.rating
    db_book.collections = json.dumps(book.collections)
    db_book.isbn = book.isbn
    db_book.year_published = book.year_published
    db_book.read_count = book.read_count
    db_book.cover_url = book.cover_url
    db_book.notes = book.notes
    db_book.start_date = book.start_date
    db_book.favorite = book.favorite
    db_book.reading_type = book.reading_type
    db_book.academic_field = book.academic_field
    db_book.academic_level = book.academic_level
    db_book.chapters_read = (
        json.dumps(book.chapters_read) if book.chapters_read is not None else None
    )
    db_book.total_chapters = book.total_chapters

    db.commit()
    db.refresh(db_book)
    return book_to_dict(db_book)


@router.delete("/{book_id}")
def delete_book(book_id: str, db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted", "id": book_id}
