from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from models.catalogo import CatalogoEstado
from pydantic import BaseModel
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EstadoOut(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

@router.get("/estados", response_model=List[EstadoOut])
def listar_estados(db: Session = Depends(get_db)):
    return db.query(CatalogoEstado).all()