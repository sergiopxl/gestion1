<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: UPDATE");

$_UPDATE = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$idContacto = $_UPDATE["input-contacto-id"];
$nombre = $_UPDATE["input-contacto-nombre"];
$apellido1 = $_UPDATE["input-contacto-apellido1"];
$apellido2 = $_UPDATE["input-contacto-apellido2"];
$telefono = $_UPDATE["input-contacto-telefono"];
$email = $_UPDATE["input-contacto-email"];

$sqlContactosUpdate = "UPDATE proveedores_contactos_tb SET
                       name = '$nombre',
                       apell1 = '$apellido1',
                       apell2 = '$apellido2',
                       phone1 = '$telefono',
                       mail1 = '$email'
                       WHERE id = $idContacto";

$respuesta = mysqli_query($conn, $sqlContactosUpdate);

$mensaje = $respuesta ? "Registro actualizado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
