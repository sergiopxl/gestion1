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

    if ($_GET["estadisticas"] == "cliente") {

        // Estadísticas de facturas por cliente

        $sqlMejoresClientes = "SELECT facturas_tb.id_cliente, clientes_tb.nombre, SUM(facturas_tb.baseimponible) AS total_facturado
                                 FROM facturas_tb
                                 JOIN clientes_tb ON facturas_tb.id_cliente = clientes_tb.id
                               WHERE facturas_tb.id_estado = 3
                               GROUP BY facturas_tb.id_cliente
                               ORDER BY total_facturado DESC";

        // Si se ha especificado un máximo de resultados, añadimos el límite
        if (isset($_GET["mostrar"])) {

            $limite = (int) $_GET["mostrar"];
            if ($limite > 0)
                $sqlMejoresClientes .= " LIMIT $limite";
        }

        $respuestaMejoresClientes = mysqli_query($conn, $sqlMejoresClientes);

        if ($respuestaMejoresClientes) {
            while ($fila = mysqli_fetch_assoc($respuestaMejoresClientes)) {
                $respuesta[] = $fila;
            }
        }
        else $error = true;
    }
    else {

        // Estadísticas generales de facturación total y por fecha

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
}

// Listado de facturas
else {

    // Factura por Id
    $condicion = "";
    $buscarPorId = false;

    if (isset($_GET["id"])) {
        $buscarPorId = true;
        $idFactura = $_GET["id"];
        $condicion = " WHERE facturas_tb.id = $idFactura ";
    }

    // Paginación
    $inicio = $_GET["inicio"] ?? 0;
    $porPagina = $_GET["porpagina"] ?? 20;

    $limite = $buscarPorId ? "" : " LIMIT $inicio, $porPagina";

    // Consulta cuántos clientes hay en total
    if ($buscarPorId) {
        $respuesta["numero_facturas"] = 1;
    } else {
        $sqlNumFacturas = "SELECT COUNT(*) AS numero_facturas FROM facturas_tb";
        $respuestaNumFacturas = mysqli_query($conn, $sqlNumFacturas);

        if ($respuestaNumFacturas) {
            $fila = mysqli_fetch_assoc($respuestaNumFacturas);
            $respuesta["numero_facturas"] = $fila["numero_facturas"];
        }
    }

    // Obtiene la lista de facturas
    $sqlFacturas = "SELECT facturas_tb.*, clientes_tb.nombre as cliente, facturas_estados_tb.nombre as estado
                      FROM `facturas_tb`
                      LEFT JOIN clientes_tb ON clientes_tb.id = facturas_tb.id_cliente
                      LEFT JOIN facturas_estados_tb ON facturas_estados_tb.id = facturas_tb.id_estado
                    $condicion $limite";

    $facturas = [];
    $respuestaFacturas = mysqli_query($conn, $sqlFacturas);
    if ($respuestaFacturas) {
        while ($factura = mysqli_fetch_assoc($respuestaFacturas)) {

            $idFactura = $factura["id"];
            $sqlFacturaItems = "SELECT * FROM facturas_items_tb WHERE id_factura = $idFactura";

            // Consultamos los "items" de la factura
            $facturaItems = [];
            $respuestaItems = mysqli_query($conn, $sqlFacturaItems);

            if ($respuestaItems) {
                while ($item = mysqli_fetch_assoc($respuestaItems)) {
                    $facturaItems[] = $item;
                }
            }
            else $error = true;

            $factura["items"] = $facturaItems;
            $facturas[] = $factura;
        }
    }
    else $error = true;

    $respuesta["facturas"] = $facturas;
}

if (!$error)
    echo json_encode($respuesta);
else
    echo json_encode("Ha habido un problema");
