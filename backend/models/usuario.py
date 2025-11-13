from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db import Base

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100))

    gestiones = relationship("Gestion", back_populates="responsable")
    eventos = relationship("Evento", back_populates="usuario")