from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db import Base
import datetime

class Evento(Base):
    __tablename__ = "evento"
    id = Column(Integer, primary_key=True, index=True)
    gestion_id = Column(Integer, ForeignKey("gestion.id"))
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    comentario = Column(Text)
    estado_id = Column(Integer, ForeignKey("catalogo_estado.id"))

    gestion = relationship("Gestion", back_populates="eventos")
    usuario = relationship("Usuario", back_populates="eventos")
    estado = relationship("CatalogoEstado")