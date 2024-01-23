<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: POST");

include("conn/conexion.php");

$idContacto = $_POST["input-contacto-id"];
$nombre = $_POST["input-contacto-nombre"];
$apellido1 = $_POST["input-contacto-apellido1"];
$apellido2 = $_POST["input-contacto-apellido2"];
$telefono = $_POST["input-contacto-telefono"];
$email = $_POST["input-contacto-email"];

$sqlContactosUpdate = "UPDATE clientes_contactos_tb SET
                       nombre = '$nombre',
                       apellido1 = '$apellido1',
                       apellido2 = '$apellido2',
                       telefono1 = '$telefono',
                       email1 = '$email'
                       WHERE id = $idContacto";

$respuesta = mysqli_query($conn, $sqlContactosUpdate);

$mensaje = $respuesta ? "Registro actualizado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
