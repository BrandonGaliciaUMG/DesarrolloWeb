<?php
$servidor = "localhost";
$usuario = "root";
$contraseña = "";
$base_datos = "tienda";

$conn = mysqli_connect($servidor, $usuario, $contraseña, $base_datos);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);

}   

echo "Conexión exitosa a la base de datos: $base_datos";
?>

