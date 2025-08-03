<?php
include 'conexion.php';

// Aquí puedes realizar consultas a la base de datos utilizando $conn

?>
<!<!DOCTYPE html>
<html>  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tienda - productos!</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
  </head>
  <body>
    <setion class="section">
        <div class ="container">
            <h1 class="title">Productos</h1>
            <a class="button is-primary" href="crear.php">Crear Producto</a>
            <table class="table is-striped is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
<?php
$resultado = $conn->query("SELECT * FROM productos");
while ($producto = $resultado->fetch_assoc()):
?>
    <tr>
        <td><?php echo $producto['id']; ?></td>
        <td><?php echo $producto['nombre']; ?></td>
        <td><?php echo $producto['precio']; ?></td>
        <td><?php echo $producto['cantidad']; ?></td>
        <td>
            <a class="button is-info" href="editar.php?id=<?php echo $producto['id']; ?>">Editar</a>
            <a class="button is-danger" href="eliminar.php?id=<?php echo $producto['id']; ?>">Eliminar</a>
        </td>
    </tr>
<?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </setion>
  </body>
  <footer class="footer">
    <div class="content has-text-centered">
        <p>
            <strong>Hecho </strong> por <a href="https://github.com/tu_usuario" target="_blank">Brandon Galicia</a>
        </p>
    </div>
</footer>
</html>