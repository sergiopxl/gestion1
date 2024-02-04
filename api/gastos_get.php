<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];
$error = false;

// Cálculo de estadísticas de gastos
if (isset($_GET["estadisticas"])) {

    if ($_GET["estadisticas"] == "proveedor") {

        // Estadísticas de facturas por proveedor

        $sqlMejoresProveedores = "SELECT gastos_tb.id_empresa, proveedores_tb.nombre, SUM(gastos_tb.baseimponible) AS total_gastado
                                    FROM gastos_tb
                                    JOIN proveedores_tb ON gastos_tb.id_empresa = proveedores_tb.id
                                  GROUP BY gastos_tb.id_empresa
                                  ORDER BY total_gastado DESC";

        // Si se ha especificado un máximo de resultados, añadimos el límite
        if (isset($_GET["mostrar"])) {

            $limite = (int) $_GET["mostrar"];
            if ($limite > 0)
                $sqlMejoresProveedores .= " LIMIT $limite";
        }

        $respuestaMejoresProveedores = mysqli_query($conn, $sqlMejoresProveedores);

        if ($respuestaMejoresProveedores) {
            while ($fila = mysqli_fetch_assoc($respuestaMejoresProveedores)) {
                $respuesta[] = $fila;
            }
        }
        else $error = true;
    }
    else {

        // Estadísticas generales de facturación total y por fecha

        // Consulta el total gastado y las fechas de inicio y fin
        $sqlTotalGastado = "SELECT SUM(baseimponible * (1 + iva / 100)) AS total_gastos,
                                MIN(CAST(fecha_emision AS DATE)) AS fecha_inicio,
                                MAX(CAST(fecha_emision AS DATE)) AS fecha_fin
                            FROM gastos_tb";

        $respuestaTotalGastado = mysqli_query($conn, $sqlTotalGastado);

        if ($respuestaTotalGastado) {
            $fila = mysqli_fetch_assoc($respuestaTotalGastado);
            $respuesta = $fila;
        }
        else $error = true;

        // Consulta el subtotal gastado por fecha
        $sqlGastosPorFecha = "SELECT SUM(baseimponible * (1 + iva / 100)) AS gastado,
                                    fecha_emision AS fecha,
                                    COUNT(*) as num_gastos
                            FROM gastos_tb
                            GROUP BY fecha";

        $respuestaGastosPorFecha = mysqli_query($conn, $sqlGastosPorFecha);

        if ($respuestaGastosPorFecha) {

            $gastosPorFecha = [];
            while ($fila = mysqli_fetch_assoc($respuestaGastosPorFecha)) {
                $gastosPorFecha[] = $fila;
            }

            $respuesta["gastos_por_fecha"] = $gastosPorFecha;
        }
        else $error = true;
    }
}

if (!$error)
    echo json_encode($respuesta);
else
    echo json_encode("Ha habido un problema");
