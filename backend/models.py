# models.py
# Coloca este archivo en la misma carpeta que db.py y main.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean
from sqlalchemy.orm import relationship
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
    nombre = Column(String(200), nullable=False, unique=True)
    descripcion = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))
    responsable_id = Column(Integer, ForeignKey("usuario.id"))
    fecha_creacion = Column(TIMESTAMP)
    tipo = Column(String(100))  # <-- asegurarse que esta línea exista
    # relaciones opcionales
    # responsable = relationship("Usuario")
    # eventos = relationship("Evento", backref="gestion", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Gestion id={self.id} nombre={self.nombre}>"

class Evento(Base):
    __tablename__ = "evento"
    id = Column(Integer, primary_key=True)
    gestion_id = Column(Integer, ForeignKey("gestion.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    fecha = Column(TIMESTAMP)
    comentario = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))

    def __repr__(self):
        return f"<Evento id={self.id} gestion={self.gestion_id}>"