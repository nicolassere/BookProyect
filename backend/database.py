from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./books.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import all models so SQLAlchemy registers them before create_all
    from models import Book, AuthorProfile, ReadingGoal  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Lightweight migrations: add new columns to existing DBs without losing data
    _migrations = [
        "ALTER TABLE books ADD COLUMN status VARCHAR",
    ]
    with engine.connect() as conn:
        for stmt in _migrations:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # Column already exists – that's fine
