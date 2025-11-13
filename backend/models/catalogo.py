from sqlalchemy import Column, Integer, String
from db import Base

class CatalogoEstado(Base):
    __tablename__ = "catalogo_estado"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)