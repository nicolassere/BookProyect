import json
from models import Book


def book_to_dict(book: Book) -> dict:
    """Convert a SQLAlchemy Book model to a plain dict matching the frontend schema."""
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "pages": book.pages,
        "genre": book.genre,
        "nationality": book.nationality,
        "date_finished": book.date_finished,
        "timestamp": book.timestamp,
        "rating": book.rating,
        "collections": json.loads(book.collections or "[]"),
        "isbn": book.isbn,
        "year_published": book.year_published,
        "read_count": book.read_count,
        "cover_url": book.cover_url,
        "notes": book.notes,
        "start_date": book.start_date,
        "favorite": bool(book.favorite),
        "reading_type": book.reading_type,
        "academic_field": book.academic_field,
        "academic_level": book.academic_level,
        "chapters_read": json.loads(book.chapters_read) if book.chapters_read else None,
        "total_chapters": book.total_chapters,
    }


def dict_to_book_kwargs(data, book_id: str) -> dict:
    """Convert a BookCreate schema to Book model kwargs."""
    return {
        "id": book_id,
        "title": data.title,
        "author": data.author,
        "pages": data.pages,
        "genre": data.genre,
        "nationality": data.nationality,
        "date_finished": data.date_finished,
        "timestamp": data.timestamp,
        "rating": data.rating,
        "collections": json.dumps(data.collections),
        "isbn": data.isbn,
        "year_published": data.year_published,
        "read_count": data.read_count,
        "cover_url": data.cover_url,
        "notes": data.notes,
        "start_date": data.start_date,
        "favorite": data.favorite,
        "reading_type": data.reading_type,
        "academic_field": data.academic_field,
        "academic_level": data.academic_level,
        "chapters_read": json.dumps(data.chapters_read) if data.chapters_read is not None else None,
        "total_chapters": data.total_chapters,
    }
