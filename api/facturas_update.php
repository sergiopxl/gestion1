<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: PUT");

$_PUT = json_decode(file_get_contents('php://input'), true);

include("conn/conexion.php");

$idFactura = $_PUT["idFactura"];
$idCliente = $_PUT["idCliente"];
$idContacto = $_PUT["idContacto"];
$iva = $_PUT["iva"];
$baseImponible = $_PUT["baseImponible"];
$fechaEmision = $_PUT["fechaEmision"];

$conceptos = $_PUT["conceptos"];

// Actualización de la Factura
$sqlFacturasUpdate = "UPDATE facturas_tb SET
                        baseimponible = $baseImponible,
                        iva           = $iva,
                        fecha_emision = CONVERT('$fechaEmision', DATE),
                        id_cliente    = $idCliente
                      WHERE id = $idFactura";

$respuestaFacturasUpdate = mysqli_query($conn, $sqlFacturasUpdate);

$datosRespuesta = [];
$datosRespuesta["mensaje"] = $respuestaFacturasUpdate
  ? "Registro creado correctamente"
  : "Tienes un problema";

$datosRespuesta["id"] = $idFactura;

// Creación de los conceptos
foreach ($conceptos as $concepto) {

  $idConcepto = $concepto["id"];
  $descripcion = $concepto["descripcion"];
  $importe = $concepto["importe"];

  $sqlConceptoUpdate = $idConcepto == 0

    // Nuevo concepto
    ? "INSERT INTO facturas_items_tb
        (descripcion, cantidad, importe, tipo, id_factura)
      VALUES
        ('$descripcion', 0, $importe, 2, $idFactura)"

    // Actualizar concepto existente
    : "UPDATE facturas_items_tb SET
         descripcion = '$descripcion',
         importe = $importe,
         id_factura = $idFactura
       WHERE id = $idConcepto";

  $respuestaConceptoUpdate = mysqli_query($conn, $sqlConceptoUpdate);
}

echo json_encode($datosRespuesta);
