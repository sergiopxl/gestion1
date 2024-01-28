<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];
$error = false;

// Cálculo de estadísticas de facturación
if (isset($_GET["estadisticas"])) {

    // Consulta el total facturado y las fechas de inicio y fin
    $sqlTotalFacturado = "SELECT SUM(baseimponible * (1 + iva / 100)) AS total_facturas,
                                 MIN(CAST(fecha_emision AS DATE)) AS fecha_inicio,
                                 MAX(CAST(fecha_emision AS DATE)) AS fecha_fin
                          FROM facturas_tb";

    $respuestaTotalFacturado = mysqli_query($conn, $sqlTotalFacturado);

    if ($respuestaTotalFacturado) {
        $fila = mysqli_fetch_assoc($respuestaTotalFacturado);
        $respuesta = $fila;
    }
    else $error = true;

    // Consulta el subtotal facturado por fecha
    $sqlFacturasPorFecha = "SELECT SUM(baseimponible * (1 + iva / 100)) AS facturado, 
                                   fecha_emision AS fecha, 
                                   COUNT(*) as num_facturas
                            FROM facturas_tb
                            GROUP BY fecha";
    
    $respuestaFacturasPorFecha = mysqli_query($conn, $sqlFacturasPorFecha);

    if ($respuestaFacturasPorFecha) {

        $facturasPorFecha = [];
        while ($fila = mysqli_fetch_assoc($respuestaFacturasPorFecha)) {
            $facturasPorFecha[] = $fila;
        }

        $respuesta["facturas_por_fecha"] = $facturasPorFecha;
    }
    else $error = true;
}

if (!$error)
    echo json_encode($respuesta);
else
    echo json_encode("Ha habido un problema");
