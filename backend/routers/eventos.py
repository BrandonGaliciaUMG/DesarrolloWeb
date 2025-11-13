from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from models.evento import Evento
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EventoCreate(BaseModel):
    gestion_id: int
    usuario_id: int
    comentario: Optional[str]
    estado_id: int

class EventoOut(BaseModel):
    id: int
    gestion_id: int
    usuario_id: int
    fecha: datetime
    comentario: Optional[str]
    estado_id: int

    class Config:
        from_attributes = True

@router.post("/", response_model=EventoOut)
def crear_evento(evento: EventoCreate, db: Session = Depends(get_db)):
    nuevo = Evento(**evento.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/", response_model=List[EventoOut])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(Evento).all()