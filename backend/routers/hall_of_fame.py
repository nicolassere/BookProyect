from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

from database import get_db
from models import HallOfFame
from schemas import HallOfFamePayload

router = APIRouter()

_EMPTY: dict = {
    "badges": [],
    "categories": [],
    "nominations": [],
    "annualAwards": [],
    "rankings": [],
    "authorPhotos": {},
}


@router.get("/")
def get_hall_of_fame(db: Session = Depends(get_db)):
    record = db.query(HallOfFame).first()
    if not record:
        return {"data": _EMPTY}
    return {"data": json.loads(record.data)}


@router.put("/")
def set_hall_of_fame(payload: HallOfFamePayload, db: Session = Depends(get_db)):
    record = db.query(HallOfFame).first()
    serialized = json.dumps(payload.data)
    if record:
        record.data = serialized
    else:
        record = HallOfFame(id=1, data=serialized)
        db.add(record)
    db.commit()
    return {"data": payload.data}
