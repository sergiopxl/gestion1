<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: POST");

include("conn/conexion.php");

$idCliente = $_POST["input-contacto-idCliente"];
$nombre = $_POST["input-contacto-nombre"];
$apellido1 = $_POST["input-contacto-apellido1"];
$apellido2 = $_POST["input-contacto-apellido2"];
$telefono = $_POST["input-contacto-telefono"];
$email = $_POST["input-contacto-email"];

$sqlContactosInsert = "INSERT INTO clientes_contactos_tb
                         (nombre, apellido1, apellido2, telefono1, email1, id_cliente)
                       VALUES
                         ('$nombre', '$apellido1', '$apellido2', '$telefono', '$email', $idCliente)";

$respuesta = mysqli_query($conn, $sqlContactosInsert);

$datosRespuesta = [];
$datosRespuesta["mensaje"] = $respuesta ? "Registro creado correctamente" : "Tienes un problema";

if ($respuesta) {
    $sqlContactosLastId = "SELECT LAST_INSERT_ID() AS id_ultimo_contacto";
    $respuesta = mysqli_query($conn, $sqlContactosLastId);

    if ($respuesta) {
        $lastId = mysqli_fetch_assoc($respuesta)["id_ultimo_contacto"];
        $datosRespuesta["id"] = $lastId;
    }
}

echo json_encode($datosRespuesta);
