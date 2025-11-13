from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db import Base
import datetime

class Gestion(Base):
    __tablename__ = "gestion"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))
    responsable_id = Column(Integer, ForeignKey("usuario.id"))
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)

    responsable = relationship("Usuario", back_populates="gestiones")
    eventos = relationship("Evento", back_populates="gestion")
    estado = relationship("CatalogoEstado")