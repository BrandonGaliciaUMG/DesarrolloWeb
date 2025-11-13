from db import Base, engine
from models.gestion import Gestion
from models.evento import Evento
from models.usuario import Usuario
from models.catalogo import CatalogoEstado

# Este comando crea todas las tablas en la base de datos
if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    print("¡Base de datos inicializada correctamente!")