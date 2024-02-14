<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: PUT");

$_PUT = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$idCliente = $_PUT["idCliente"];
$idContacto = $_PUT["idContacto"];
$iva = $_PUT["iva"];
$baseImponible = $_PUT["baseImponible"];
$fechaEmision = $_PUT["fechaEmision"];

$conceptos = $_PUT["conceptos"];

// Creación de la Factura
$sqlFacturasInsert = "INSERT INTO facturas_tb
                        (baseimponible, recargo, iva, descripcion, fecha_emision, fecha_envio, fecha_pago, id_cliente, id_estado)
                      VALUES
                        ($baseImponible, 0, $iva, '', CONVERT('$fechaEmision', DATE), '0000-00-00', '0000-00-00', $idCliente, 1)";

$respuestaFacturasInsert = mysqli_query($conn, $sqlFacturasInsert);

$datosRespuesta = [];
$datosRespuesta["mensaje"] = $respuestaFacturasInsert
  ? "Registro creado correctamente"
  : "Tienes un problema";

if ($respuestaFacturasInsert) {
  $sqlFacturasLastId = "SELECT LAST_INSERT_ID() AS id_ultima_factura";
  $respuesta = mysqli_query($conn, $sqlFacturasLastId);

  if ($respuesta) {
      $lastId = mysqli_fetch_assoc($respuesta)["id_ultima_factura"];
      $datosRespuesta["id"] = $lastId;
  }
}

// Creación de los conceptos
foreach ($conceptos as $concepto) {

  $descripcion = $concepto["descripcion"];
  $importe = $concepto["importe"];

  $sqlConceptoInsert = "INSERT INTO facturas_items_tb
                          (descripcion, cantidad, importe, tipo, id_factura)
                        VALUES
                          ('$descripcion', 0, $importe, 2, $lastId)";

  $respuestaConceptoInsert = mysqli_query($conn, $sqlConceptoInsert);
}

echo json_encode($datosRespuesta);
