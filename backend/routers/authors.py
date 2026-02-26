from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import AuthorProfile
from schemas import AuthorProfileCreate, AuthorProfileResponse

router = APIRouter()


def profile_to_dict(p: AuthorProfile) -> dict:
    return {
        "name": p.name,
        "nationality": p.nationality,
        "primary_genre": p.primary_genre,
        "favorite_book": p.favorite_book,
        "bio": p.bio,
    }


@router.get("/", response_model=List[AuthorProfileResponse])
def get_authors(db: Session = Depends(get_db)):
    profiles = db.query(AuthorProfile).order_by(AuthorProfile.name).all()
    return [profile_to_dict(p) for p in profiles]


@router.get("/{name}", response_model=AuthorProfileResponse)
def get_author(name: str, db: Session = Depends(get_db)):
    profile = db.query(AuthorProfile).filter(AuthorProfile.name == name).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Author not found")
    return profile_to_dict(profile)


@router.post("/", response_model=AuthorProfileResponse)
def upsert_author(profile: AuthorProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(AuthorProfile).filter(AuthorProfile.name == profile.name).first()

    if existing:
        existing.nationality = profile.nationality
        existing.primary_genre = profile.primary_genre
        existing.favorite_book = profile.favorite_book
        existing.bio = profile.bio
        db.commit()
        db.refresh(existing)
        return profile_to_dict(existing)

    new_profile = AuthorProfile(
        name=profile.name,
        nationality=profile.nationality,
        primary_genre=profile.primary_genre,
        favorite_book=profile.favorite_book,
        bio=profile.bio,
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return profile_to_dict(new_profile)


@router.delete("/{name}")
def delete_author(name: str, db: Session = Depends(get_db)):
    profile = db.query(AuthorProfile).filter(AuthorProfile.name == name).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Author not found")
    db.delete(profile)
    db.commit()
    return {"message": "Author profile deleted", "name": name}
