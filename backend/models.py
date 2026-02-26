from sqlalchemy import Column, String, Integer, Float, Boolean, Text
from database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False, index=True)
    pages = Column(Integer, nullable=False)
    genre = Column(String, nullable=False, index=True)
    nationality = Column(String, nullable=False, index=True)
    date_finished = Column(String, nullable=False)
    timestamp = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    collections = Column(Text, default="[]")    # JSON array of strings
    isbn = Column(String, nullable=True)
    year_published = Column(Integer, nullable=True)
    read_count = Column(Integer, nullable=True)
    cover_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    start_date = Column(String, nullable=True)
    favorite = Column(Boolean, default=False)
    reading_type = Column(String, nullable=True)    # complete | academic | reference
    academic_field = Column(String, nullable=True)
    academic_level = Column(String, nullable=True)  # undergraduate | graduate | reference
    chapters_read = Column(Text, nullable=True)     # JSON array of ints
    total_chapters = Column(Integer, nullable=True)


class AuthorProfile(Base):
    __tablename__ = "author_profiles"

    name = Column(String, primary_key=True, index=True)
    nationality = Column(String, nullable=False)
    primary_genre = Column(String, nullable=False)
    favorite_book = Column(String, nullable=True)
    bio = Column(Text, nullable=True)


class ReadingGoal(Base):
    __tablename__ = "reading_goals"

    year = Column(Integer, primary_key=True)
    target_books = Column(Integer, nullable=False)
