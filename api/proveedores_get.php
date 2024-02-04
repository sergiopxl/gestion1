<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];

$condicion = "";

// Búsqueda
if (isset($_GET["buscar"])) {
    $busqueda = $_GET["buscar"];
    $condicion = " WHERE (UPPER(proveedores_tb.nombre) LIKE UPPER('%$busqueda%') OR
                          UPPER(proveedores_tb.cif) LIKE UPPER('%$busqueda%')) ";
}

// Paginación
$inicio = $_GET["inicio"] ?? 0;
$porPagina = $_GET["porpagina"] ?? 20;

$limite = " LIMIT $inicio, $porPagina";

// Consulta cuántos proveedores hay en total
$sqlNumProveedores = "SELECT COUNT(*) AS numero_proveedores FROM proveedores_tb $condicion";
$respuestaNumProveedores = mysqli_query($conn, $sqlNumProveedores);

if ($respuestaNumProveedores) {
    $fila = mysqli_fetch_assoc($respuestaNumProveedores);
    $respuesta["numero_proveedores"] = $fila["numero_proveedores"];
}

// Consulta los proveedores solicitados
$sqlProveedores = "SELECT proveedores_tb.*, proveedores_servicios_tb.name AS servicio
                   FROM `proveedores_tb`
                   LEFT JOIN proveedores_servicios_tb ON proveedores_tb.id_servicio = proveedores_servicios_tb.id
                   $condicion $limite";

$resultadoProveedores = mysqli_query($conn, $sqlProveedores);

$proveedores = [];

// Para cada proveedor, consulta sus contactos y el gasto total
while ($proveedor = mysqli_fetch_assoc($resultadoProveedores)) {

    // Contactos
    $sqlContactos = "SELECT * FROM proveedores_contactos_tb
                     WHERE id_proveedor = " . $proveedor["id"] . "
                     ORDER BY id DESC";

    $resultadoContactos = mysqli_query($conn, $sqlContactos);
    
    $contactos = [];
    while ($contacto = mysqli_fetch_assoc($resultadoContactos)) {
        $contactos[] = $contacto;
    }

    $proveedor["contactos"] = $contactos;

    // Gasto total + IVA
    $sqlGasto = "SELECT SUM(baseimponible * (1 + iva / 100)) AS gasto
                 FROM gastos_tb
                 WHERE id_empresa = " . $proveedor["id"];

    $resultadoGasto = mysqli_query($conn, $sqlGasto);

    if ($resultadoGasto) {
        $fila = mysqli_fetch_assoc($resultadoGasto);
        $proveedor["gasto"] = $fila["gasto"] ?? 0;
    }

    $proveedores[] = $proveedor;
}

$respuesta["proveedores"] = $proveedores;

echo json_encode($respuesta);
