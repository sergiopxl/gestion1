<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: PUT");

$_PUT = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$nombre = $_PUT["input-cliente-nombre"];
$cif = $_PUT["input-cliente-cif"];
$telefono = $_PUT["input-cliente-tlf"];
$direccion = $_PUT["input-cliente-direccion"];
$idSector = $_PUT["select-cliente-sector"];

$sqlClientesInsert = "INSERT INTO clientes_tb 
                        (nombre, cif, direccion, cp, provincia, poblacion, telefono, web, descripcion, cuenta, activo, id_sector, id_origen, id_servicio, id_usuario)
                      VALUES
                        ('$nombre', '$cif', '$direccion', '', '', '', '$telefono', '', '', '', '1', $idSector, 1, 1, 1)";

$respuesta = mysqli_query($conn, $sqlClientesInsert);

$mensaje = $respuesta ? "Registro creado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
