# backend/models/models.py
# Modelos SQLAlchemy (incluye ComentarioPlantilla)
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from db import Base

class CatalogoEstado(Base):
    __tablename__ = "catalogo_estado"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    orden = Column(Integer, default=0)
    is_terminal = Column(Boolean, default=False)

    def __repr__(self):
        return f"<CatalogoEstado id={self.id} nombre={self.nombre}>"

class EstadoTransicion(Base):
    __tablename__ = "estado_transiciones"
    from_estado_id = Column(Integer, ForeignKey("catalogo_estado.id", ondelete="CASCADE"), primary_key=True)
    to_estado_id = Column(Integer, ForeignKey("catalogo_estado.id", ondelete="CASCADE"), primary_key=True)

    def __repr__(self):
        return f"<EstadoTransicion {self.from_estado_id} -> {self.to_estado_id}>"

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100))
    correo = Column(String(100))

    def __repr__(self):
        return f"<Usuario id={self.id} nombre={self.nombre}>"

class Gestion(Base):
    __tablename__ = "gestion"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))
    responsable_id = Column(Integer, ForeignKey("usuario.id"))
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

    def __repr__(self):
        return f"<Gestion id={self.id} nombre={self.nombre}>"

class Evento(Base):
    __tablename__ = "evento"
    id = Column(Integer, primary_key=True)
    gestion_id = Column(Integer, ForeignKey("gestion.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    fecha = Column(TIMESTAMP, server_default=func.now())
    comentario = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))

    def __repr__(self):
        return f"<Evento id={self.id} gestion={self.gestion_id}>"

class ComentarioPlantilla(Base):
    __tablename__ = "comentario_plantilla"
    id = Column(Integer, primary_key=True, index=True)
    tipo_gestion = Column(String(100), nullable=True)  # NULL = aplica a todos los tipos
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(200), default="")
    template = Column(Text, default="")
    required = Column(Boolean, default=False)
    roles_allowed = Column(String(200), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ComentarioPlantilla id={self.id} estado_id={self.estado_id} tipo={self.tipo_gestion}>"