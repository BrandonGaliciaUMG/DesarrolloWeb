<?php
// Incluir archivo de conexión a la base de datos
include 'conexion.php';

// Verificar si se ha enviado el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $nombre = $_POST["nombre"];
    $precio = $_POST["precio"];
    $cantidad = $_POST["cantidad"];

    // Insertar los datos en la base de datos
    $sql = "INSERT INTO productos (nombre, precio, cantidad) VALUES ('$nombre', '$precio', '$cantidad')";
    if (mysqli_query($conn, $sql)) {
        echo "Nuevo registro creado exitosamente";
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($conn);
    }
}



// Cerrar la conexión
mysqli_close($conn);
?>

<!DOCTYPE html>
<html>  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Agregar Producto!</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
  </head>
  <body>

  <form action="crear.php" method="POST">
<section class="section">
    <div class="container">
        <h1 class="title">Crear Producto</h1>
    </div>

 <section class="section">
    <div class="field">
        <label class="label">Nombre</label>
        <div class="control">
            <input class="input" type="text" name="nombre" placeholder="Nombre del producto" required>
        </div>
    </div>
    <div class="field">
        <label class="label">Precio</label>
        <div class="control">
            <input class="input" type="number" step="0.01" name="precio" placeholder="Precio del producto" required>
        </div>
    </div>
    <div class="field">
        <label class="label">Cantidad</label>
        <div class="control">
            <input class="input" type="number" name="cantidad" placeholder="Cantidad del producto" required>
        </div>
    </div>
    <div class="field is-grouped">
        <div class="control">
            <button class="button is-primary" type="submit">Agregar Producto</button>
        </div>
        <div class="control">
            <a class="button is-link" href="index.php">Volver a Productos</a>
        </div>
    </div>
</section>
</form>
  </body>
</html>