from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import SessionLocal, engine  # ajusta según tu proyecto
from models import Gestion, Usuario, CatalogoEstado, Evento

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/debug/db_url")
def debug_db_url():
    # Muestra la URL de conexión usada por SQLAlchemy (útil para confirmar que apunta a la BD correcta)
    # Nota: en entornos públicos NO exponer credenciales. Esto es para entorno local/dev.
    try:
        url = str(engine.url)
    except Exception as e:
        url = f"ERROR: {e}"
    return {"engine_url": url}

@router.get("/debug/gestiones_compare")
def debug_gestiones_compare(db: Session = Depends(get_db)):
    """
    Compara para cada gestión (id, nombre):
      - tipo_orm: valor leído por el objeto ORM Gestion
      - tipo_sql: valor leído por SELECT tipo FROM gestion WHERE id = :id
    Devuelve lista para inspección.
    """
    out = []
    gests = db.query(Gestion).order_by(Gestion.id).all()
    for g in gests:
        # asegúrate de refrescar la entidad por si hay caching
        try:
            db.refresh(g)
        except Exception:
            pass
        tipo_orm = getattr(g, "tipo", None)
        row = db.execute(text("SELECT tipo FROM gestion WHERE id = :id"), {"id": g.id}).fetchone()
        tipo_sql = row[0] if row is not None else None
        out.append({
            "id": g.id,
            "nombre": g.nombre,
            "tipo_orm": tipo_orm,
            "tipo_sql": tipo_sql
        })
    return out

@router.get("/debug/gestion_tipo_raw/{gestion_id}")
def debug_gestion_tipo_raw(gestion_id: int, db: Session = Depends(get_db)):
    """Devuelve solo SELECT tipo FROM gestion WHERE id = :id"""
    row = db.execute(text("SELECT id, nombre, tipo FROM gestion WHERE id = :id"), {"id": gestion_id}).fetchone()
    if not row:
        return {"found": False, "id": gestion_id}
    return {"found": True, "id": row[0], "nombre": row[1], "tipo_sql": row[2]}

@router.get("/debug/gestion_tipo_orm/{gestion_id}")
def debug_gestion_tipo_orm(gestion_id: int, db: Session = Depends(get_db)):
    """Devuelve el valor 'tipo' leído desde el ORM para una gestión"""
    g = db.query(Gestion).filter(Gestion.id == gestion_id).first()
    if not g:
        return {"found": False, "id": gestion_id}
    try:
        db.refresh(g)
    except Exception:
        pass
    return {"found": True, "id": g.id, "nombre": g.nombre, "tipo_orm": getattr(g, "tipo", None)}