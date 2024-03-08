<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: PUT");

$_PUT = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$nombre = $_PUT["input-proveedor-nombre"];
$cif = $_PUT["input-proveedor-cif"];
$telefono = $_PUT["input-proveedor-tlf"];
$direccion = $_PUT["input-proveedor-direccion"];
$idServicio = $_PUT["select-proveedor-servicio"];

$sqlProveedoresInsert = "INSERT INTO proveedores_tb
                           (nombre, cif, direccion, cp, provincia, poblacion, telefono, web, descripcion, id_servicio)
                         VALUES
                           ('$nombre', '$cif', '$direccion', '', '', '', '$telefono', '', '', $idServicio)";

$respuesta = mysqli_query($conn, $sqlProveedoresInsert);

$mensaje = $respuesta ? "Registro creado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
