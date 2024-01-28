<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: DELETE");

include("conn/conexion.php");

$idContacto = $_GET["contacto-id"];

$sqlContactosUpdate = "DELETE FROM clientes_contactos_tb
                       WHERE id = $idContacto";

$respuesta = mysqli_query($conn, $sqlContactosUpdate);

$mensaje = $respuesta ? "Registro eliminado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
