<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: UPDATE");

$_UPDATE = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$idProveedor = $_UPDATE["input-proveedor-id"];
$nombre = $_UPDATE["input-proveedor-nombre"];
$cif = $_UPDATE["input-proveedor-cif"];
$telefono = $_UPDATE["input-proveedor-tlf"];
$direccion = $_UPDATE["input-proveedor-direccion"];
$idServicio = $_UPDATE["select-proveedor-servicio"];

$sqlProveedoresUpdate = "UPDATE proveedores_tb SET
                         nombre = '$nombre',
                         cif = '$cif',
                         telefono = '$telefono',
                         direccion = '$direccion',
                         id_servicio = $idServicio
                         WHERE id = $idProveedor";

$respuesta = mysqli_query($conn, $sqlProveedoresUpdate);

$mensaje = $respuesta ? "Registro actualizado correctamente" : "Tienes un problema";
echo json_encode($mensaje);
