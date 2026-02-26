from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ReadingGoal
from schemas import ReadingGoalCreate, ReadingGoalResponse

router = APIRouter()


@router.get("/{year}", response_model=ReadingGoalResponse)
def get_goal(year: int, db: Session = Depends(get_db)):
    goal = db.query(ReadingGoal).filter(ReadingGoal.year == year).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found for this year")
    return {"year": goal.year, "target_books": goal.target_books}


@router.post("/", response_model=ReadingGoalResponse)
def set_goal(goal: ReadingGoalCreate, db: Session = Depends(get_db)):
    existing = db.query(ReadingGoal).filter(ReadingGoal.year == goal.year).first()
    if existing:
        existing.target_books = goal.target_books
        db.commit()
        db.refresh(existing)
        return {"year": existing.year, "target_books": existing.target_books}

    new_goal = ReadingGoal(year=goal.year, target_books=goal.target_books)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return {"year": new_goal.year, "target_books": new_goal.target_books}
