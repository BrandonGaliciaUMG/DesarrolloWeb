<?php

include 'conexion.php';

$id = $_GET['id'];
$resultado= $conn->query("SELECT * FROM productos WHERE id = $id");
$producto = $resultado->fetch_assoc();

if ($_SERVER['REQUEST_METHOD']=== 'POST') {
    $nombre   = trim($_POST['nombre'] ?? '');
    $precio   = $_POST['precio'] ?? null;
    $cantidad = $_POST['cantidad'] ?? null;

    if ($nombre === '' || !is_numeric($precio) || !is_numeric($cantidad)) {
        $error = 'Revisa los datos introducidos.';
    } else {
        $stmt = $conn->prepare("UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?");
        if (!$stmt) {
            $error = 'Error al preparar la consulta: ' . $conn->error;
        } else {
            $precio = (float)$precio;
            $cantidad = (int)$cantidad;
            $stmt->bind_param("sdii", $nombre, $precio, $cantidad, $id);

            if ($stmt->execute()) {
                header('Location: index.php?msg=actualizado');
                exit;
            } else {
                $error = 'No se pudo actualizar: ' . $stmt->error;
            }
            $stmt->close();
        }
    }
}
?>

!<<!DOCTYPE html>
<html>  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Editar producto</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
  </head>
  <body>
  <section class="section">
    <div class="container">
      <h1 class="title">Editar producto</h1>

  

      <form action="editar.php?id=<?= $producto['id'] ?>" method="post">
        <div class="field">
          <label class="label">Nombre</label>
          <div class="control">
            <input class="input" type="text" name="nombre" value="<?= htmlspecialchars($producto['nombre'], ENT_QUOTES, 'UTF-8') ?>" required>
          </div>
        </div>

        <div class="field">
          <label class="label">Precio</label>
          <div class="control">
            <input class="input" type="number" step="0.01" name="precio" value="<?= htmlspecialchars($producto['precio'], ENT_QUOTES, 'UTF-8') ?>" required>
          </div>
        </div>

        <div class="field">
          <label class="label">Cantidad</label>
          <div class="control">
            <input class="input" type="number" name="cantidad" value="<?= htmlspecialchars($producto['cantidad'], ENT_QUOTES, 'UTF-8') ?>" required>
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" type="submit">Actualizar producto</button>
          </div>
          <div class="control">
            <a class="button is-link is-light" href="index.php">Cancelar</a>
          </div>
        </div>
      </form>
    </div>
  </section>
  </body>
</html>