from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text, or_

# Ajusta según tu proyecto
from db import SessionLocal, engine, Base
from models import (
    CatalogoEstado,
    EstadoTransicion,
    Usuario,
    Gestion,
    Evento,
    ComentarioPlantilla,
)

# Crear tablas si no existen (solo en dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestor - API (tipo fix)")

# CORS (ajusta según tu entorno)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class EventoCreate(BaseModel):
    usuario_id: Optional[int] = None
    comentario: Optional[str] = None
    estado_id: Optional[int] = None
    apply_transition: bool = False

def _is_int(s: str) -> bool:
    try:
        int(s)
        return True
    except Exception:
        return False

# Catalogos
@app.get("/api/catalogos/estados")
def get_estados(db: Session = Depends(get_db)):
    estados = db.query(CatalogoEstado).order_by(CatalogoEstado.orden).all()
    out = []
    for e in estados:
        rows = db.query(EstadoTransicion).filter(EstadoTransicion.from_estado_id == e.id).all()
        allowed = [r.to_estado_id for r in rows]
        out.append({
            "id": e.id,
            "nombre": e.nombre,
            "orden": e.orden or 0,
            "is_terminal": bool(e.is_terminal),
            "allowed_next": allowed
        })
    return out

@app.get("/api/catalogos/comentario-plantillas")
def get_plantillas(db: Session = Depends(get_db)):
    rows = db.query(ComentarioPlantilla).order_by(ComentarioPlantilla.id).all()
    return [
        {
            "id": r.id,
            "tipo_gestion": r.tipo_gestion,
            "estado_id": r.estado_id,
            "titulo": r.titulo,
            "template": r.template,
            "required": bool(r.required),
            "roles_allowed": r.roles_allowed
        } for r in rows
    ]

# Usuarios
@app.get("/api/usuarios/")
def list_usuarios(db: Session = Depends(get_db)):
    users = db.query(Usuario).all()
    return [{"id": u.id, "nombre": u.nombre, "correo": u.correo} for u in users]

# Gestiones: LIST (LEE tipo con SELECT directo para asegurarnos)
@app.get("/api/gestiones/")
def list_gestiones(db: Session = Depends(get_db)):
    gests = db.query(Gestion).all()
    out = []
    for g in gests:
        # Leer 'tipo' directamente con SQL para evitar problemas de mapeo ORM
        row = db.execute(text("SELECT tipo FROM gestion WHERE id = :id"), {"id": g.id}).fetchone()
        tipo_val = row[0] if row is not None else None
        out.append({
            "id": g.id,
            "nombre": g.nombre,
            "descripcion": g.descripcion,
            "estado_id": g.estado_id,
            "tipo": tipo_val,
            "responsable_id": g.responsable_id,
            "fecha_creacion": str(g.fecha_creacion) if g.fecha_creacion is not None else None
        })
    return out

# Gestiones: DETAIL (id o búsqueda por nombre)
@app.get("/api/gestiones/{code}")
def get_gestion_by_code(code: str, db: Session = Depends(get_db)):
    g = None
    if _is_int(code):
        g = db.query(Gestion).filter(Gestion.id == int(code)).first()
    else:
        g = db.query(Gestion).filter(Gestion.nombre.ilike(f"%{code}%")).first()

    if not g:
        raise HTTPException(status_code=404, detail="Gestión no encontrada")

    # Leer tipo con SQL
    row = db.execute(text("SELECT tipo FROM gestion WHERE id = :id"), {"id": g.id}).fetchone()
    tipo_val = row[0] if row is not None else None

    estado_nombre = None
    if g.estado_id:
        est = db.query(CatalogoEstado).filter(CatalogoEstado.id == g.estado_id).first()
        if est:
            estado_nombre = est.nombre

    eventos = db.query(Evento).filter(Evento.gestion_id == g.id).order_by(Evento.fecha.asc(), Evento.id.asc()).all()
    etapas = []
    for ev in eventos:
        ev_estado_nombre = None
        if ev.estado_id:
            est2 = db.query(CatalogoEstado).filter(CatalogoEstado.id == ev.estado_id).first()
            ev_estado_nombre = est2.nombre if est2 else None
        etapas.append({
            "id": ev.id,
            "fecha": str(ev.fecha) if ev.fecha is not None else None,
            "comentario": ev.comentario,
            "usuario_id": ev.usuario_id,
            "estado_id": ev.estado_id,
            "estado_nombre": ev_estado_nombre
        })

    responsable_nombre = None
    if g.responsable_id:
        u = db.query(Usuario).filter(Usuario.id == g.responsable_id).first()
        responsable_nombre = u.nombre if u else None

    return {
        "id": g.id,
        "nombre": g.nombre,
        "descripcion": g.descripcion,
        "estado_id": g.estado_id,
        "estado_nombre": estado_nombre,
        "tipo": tipo_val,
        "responsable_id": g.responsable_id,
        "responsable_nombre": responsable_nombre,
        "fecha_creacion": str(g.fecha_creacion) if g.fecha_creacion else None,
        "etapas": etapas
    }

# Crear evento / aplicar transición (sin cambios)
@app.post("/api/gestiones/{gestion_id}/eventos")
def create_evento(gestion_id: int, payload: EventoCreate, db: Session = Depends(get_db)):
    g = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Gestión no encontrada")

    if payload.apply_transition and payload.estado_id is not None:
        if g.estado_id is not None:
            allowed = db.query(EstadoTransicion).filter(
                EstadoTransicion.from_estado_id == g.estado_id,
                EstadoTransicion.to_estado_id == payload.estado_id
            ).first()
            if allowed is None:
                raise HTTPException(status_code=400, detail="Transición no permitida desde el estado actual")

        plantilla = db.query(ComentarioPlantilla).filter(ComentarioPlantilla.estado_id == payload.estado_id).filter(
            or_(ComentarioPlantilla.tipo_gestion == getattr(g, "tipo", None), ComentarioPlantilla.tipo_gestion == None)
        ).order_by(ComentarioPlantilla.tipo_gestion.desc()).first()

        if plantilla and plantilla.required and (not payload.comentario or payload.comentario.strip() == ""):
            raise HTTPException(status_code=400, detail="Se requiere comentario para esta transición")

    nuevo_evento = Evento(
        gestion_id=g.id,
        usuario_id=payload.usuario_id,
        comentario=payload.comentario,
        estado_id=payload.estado_id
    )
    db.add(nuevo_evento)

    if payload.apply_transition and payload.estado_id is not None:
        g.estado_id = payload.estado_id
        db.add(g)

    db.commit()
    db.refresh(nuevo_evento)

    return {
        "id": nuevo_evento.id,
        "gestion_id": nuevo_evento.gestion_id,
        "usuario_id": nuevo_evento.usuario_id,
        "fecha": str(nuevo_evento.fecha) if nuevo_evento.fecha else None,
        "comentario": nuevo_evento.comentario,
        "estado_id": nuevo_evento.estado_id
    }

@app.get("/")
def root():
    return {"status": "ok", "message": "API Gestor funcionando (tipo fix)"}