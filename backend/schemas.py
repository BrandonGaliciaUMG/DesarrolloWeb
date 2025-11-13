# schemas.py
# Coloca este archivo junto a models.py y db.py

from pydantic import BaseModel
from typing import List

class EstadoOut(BaseModel):
    id: int
    nombre: str
    orden: int
    is_terminal: bool
    allowed_next: List[int] = []

    class Config:
        orm_mode = True