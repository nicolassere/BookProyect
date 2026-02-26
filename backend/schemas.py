from pydantic import BaseModel
from typing import Optional, List, Literal


class BookCreate(BaseModel):
    id: Optional[str] = None
    title: str
    author: str
    pages: int
    genre: str
    nationality: str
    date_finished: str
    timestamp: Optional[str] = None
    rating: Optional[float] = None
    collections: List[str] = []
    isbn: Optional[str] = None
    year_published: Optional[int] = None
    read_count: Optional[int] = None
    cover_url: Optional[str] = None
    notes: Optional[str] = None
    start_date: Optional[str] = None
    favorite: bool = False
    reading_type: Optional[Literal["complete", "academic", "reference"]] = None
    academic_field: Optional[str] = None
    academic_level: Optional[Literal["undergraduate", "graduate", "reference"]] = None
    chapters_read: Optional[List[int]] = None
    total_chapters: Optional[int] = None


class BookResponse(BookCreate):
    id: str

    class Config:
        from_attributes = True


class AuthorProfileCreate(BaseModel):
    name: str
    nationality: str
    primary_genre: str
    favorite_book: Optional[str] = None
    bio: Optional[str] = None


class AuthorProfileResponse(AuthorProfileCreate):
    class Config:
        from_attributes = True


class ReadingGoalCreate(BaseModel):
    year: int
    target_books: int


class ReadingGoalResponse(ReadingGoalCreate):
    class Config:
        from_attributes = True


class ImportRequest(BaseModel):
    readings: List[BookCreate]
    author_profiles: Optional[List[AuthorProfileCreate]] = None
    replace: bool = False


class BulkImportResponse(BaseModel):
    imported: int
    skipped: int
    total: int
    message: str
