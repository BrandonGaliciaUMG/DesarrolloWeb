<?php

include 'conexion.php';

$id = $_GET['id'];
$resultado= $conn->query("SELECT * FROM productos WHERE id = $id");
$producto = $resultado->fetch_assoc();

if ($_SERVER['REQUEST_METHOD']=== 'POST') {
    $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
    if (!$stmt) {
        $error = 'Error al preparar la consulta: ' . $conn->error;
    } else {
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            header('Location: index.php?msg=eliminado');
            exit;
        } else {
            $error = 'No se pudo eliminar: ' . $stmt->error;
        }
        $stmt->close();
    }
}

?>
<!<!DOCTYPE html>

<html>  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Eliminar producto</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
  </head>
  <body>
  <section class="section">
    <div class="container">
      <h1 class="title">Eliminar producto</h1>

      <?php if (isset($error)): ?>
        <div class="notification is-danger">
          <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
        </div>
      <?php endif; ?>

      <form action="eliminar.php?id=<?= $producto['id'] ?>" method="post">
        <p>¿Estás seguro de que deseas eliminar el producto "<strong><?= htmlspecialchars($producto['nombre'], ENT_QUOTES, 'UTF-8') ?></strong>"?</p>
        <br>
        <button class="button is-danger" type="submit">Sí, eliminar</button>
        <a class="button is-link" href="index.php">No, volver a productos</a>
      </form>
    </div>
  </section>
  </body>
</html>