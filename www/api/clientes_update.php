<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: UPDATE");

$_UPDATE = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$idCliente = $_UPDATE["input-cliente-id"];
$nombre = $_UPDATE["input-cliente-nombre"];
$cif = $_UPDATE["input-cliente-cif"];
$telefono = $_UPDATE["input-cliente-tlf"];
$direccion = $_UPDATE["input-cliente-direccion"];
$idSector = $_UPDATE["select-cliente-sector"];

$sqlClientesUpdate = "UPDATE clientes_tb SET
                      nombre = '$nombre',
                      cif = '$cif',
                      telefono = '$telefono',
                      direccion = '$direccion',
                      id_sector = $idSector
                      WHERE id = $idCliente";

$respuesta = mysqli_query($conn, $sqlClientesUpdate);

$mensaje = $respuesta ? "Registro actualizado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
