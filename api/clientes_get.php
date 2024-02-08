<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];

$condicion = " WHERE activo = 1 ";

// Cliente por Id
$buscarPorId = false;

if (isset($_GET["id"])) {
    $buscarPorId = true;
    $idCliente = $_GET["id"];
    $condicion .= " AND clientes_tb.id = $idCliente ";
}

// Determina si se deben devolver los Contactos de los Clientes o si se debe calcular
// la facturación para cada Cliente
$simple = isset($_GET["simple"]);

// Búsqueda
if (isset($_GET["buscar"])) {
    $busqueda = $_GET["buscar"];
    $condicion .= " AND (UPPER(clientes_tb.nombre) LIKE UPPER('%$busqueda%') OR
                         UPPER(clientes_tb.cif) LIKE UPPER('%$busqueda%')) ";
}

// Paginación
$inicio = $_GET["inicio"] ?? 0;
$porPagina = $_GET["porpagina"] ?? 20;

$limite = $buscarPorId ? "" : " LIMIT $inicio, $porPagina";

// Consulta cuántos Clientes hay en total
if ($buscarPorId) {
    $respuesta["numero_clientes"] = 1;
} else {
    $sqlNumClientes = "SELECT COUNT(*) AS numero_clientes FROM clientes_tb $condicion";
    $respuestaNumClientes = mysqli_query($conn, $sqlNumClientes);

    if ($respuestaNumClientes) {
        $fila = mysqli_fetch_assoc($respuestaNumClientes);
        $respuesta["numero_clientes"] = $fila["numero_clientes"];
    }
}

// Consulta los Clientes solicitados

// En el modo "simple", sólo se devuelve el Id, Nombre y CIF
$sqlClientes = $simple
    ? "SELECT id, nombre, cif FROM `clientes_tb` $condicion $limite"

    : "SELECT clientes_tb.*, clientes_sectores_tb.nombre AS sector
         FROM `clientes_tb`
         LEFT JOIN clientes_sectores_tb ON clientes_tb.id_sector = clientes_sectores_tb.id
       $condicion $limite";

$resultadoClientes = mysqli_query($conn, $sqlClientes);

$clientes = [];

// Para cada cliente, consulta sus contactos y su facturación total
while ($cliente = mysqli_fetch_assoc($resultadoClientes)) {

    if (!$simple) {

        // En modo simple, no buscamos los Contactos del Cliente

        // Contactos
        $sqlContactos = "SELECT * FROM clientes_contactos_tb
                         WHERE id_cliente = " . $cliente["id"] . "
                         ORDER BY id DESC";

        $resultadoContactos = mysqli_query($conn, $sqlContactos);

        $contactos = [];
        while ($contacto = mysqli_fetch_assoc($resultadoContactos)) {
            $contactos[] = $contacto;
        }

        $cliente["contactos"] = $contactos;

        // En modo simple, no calculamos la facturación para el Cliente

        // Facturación total + IVA
        $sqlFacturacion = "SELECT SUM(baseimponible * (1 + iva / 100)) AS facturacion
                           FROM facturas_tb
                           WHERE id_cliente = " . $cliente["id"];

        $resultadoFacturacion = mysqli_query($conn, $sqlFacturacion);

        if ($resultadoFacturacion) {
            $fila = mysqli_fetch_assoc($resultadoFacturacion);
            $cliente["facturacion"] = $fila["facturacion"] ?? 0;
        }
    }

    $clientes[] = $cliente;
}

$respuesta["clientes"] = $clientes;

echo json_encode($respuesta);
