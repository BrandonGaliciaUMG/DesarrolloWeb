from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from models.gestion import Gestion
from models.usuario import Usuario
from models.catalogo import CatalogoEstado
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


router = APIRouter()

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Esquemas Pydantic para entrada y salida de datos
class GestionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    estado_id: int
    responsable_id: int

class GestionOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    estado_id: int
    responsable_id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=GestionOut)
def crear_gestion(gestion: GestionCreate, db: Session = Depends(get_db)):
    nueva_gestion = Gestion(
        nombre=gestion.nombre,
        descripcion=gestion.descripcion,
        estado_id=gestion.estado_id,
        responsable_id=gestion.responsable_id
    )
    db.add(nueva_gestion)
    db.commit()
    db.refresh(nueva_gestion)
    return nueva_gestion

@router.get("/", response_model=List[GestionOut])
def listar_gestiones(db: Session = Depends(get_db)):
    return db.query(Gestion).all()

@router.get("/{gestion_id}", response_model=GestionOut)
def obtener_gestion(gestion_id: int, db: Session = Depends(get_db)):
    gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestión no encontrada")
    return gestion

@router.put("/{gestion_id}", response_model=GestionOut)
def actualizar_gestion(gestion_id: int, datos: GestionCreate, db: Session = Depends(get_db)):
    gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestión no encontrada")
    gestion.nombre = datos.nombre
    gestion.descripcion = datos.descripcion
    gestion.estado_id = datos.estado_id
    gestion.responsable_id = datos.responsable_id
    db.commit()
    db.refresh(gestion)
    return gestion

@router.delete("/{gestion_id}")
def eliminar_gestion(gestion_id: int, db: Session = Depends(get_db)):
    gestion = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not gestion:
        raise HTTPException(status_code=404, detail="Gestión no encontrada")
    db.delete(gestion)
    db.commit()
    return {"detail": "Gestión eliminada correctamente"}