<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];

// Paginación
$inicio = $_GET["inicio"];
$porPagina = $_GET["porpagina"];

$limite = " LIMIT $inicio, $porPagina";

// Consulta cuántos clientes hay en total
$sqlNumClientes = "SELECT COUNT(*) AS numero_clientes FROM clientes_tb WHERE activo = 1";
$respuestaNumClientes = mysqli_query($conn, $sqlNumClientes);

if ($respuestaNumClientes) {
    $fila = mysqli_fetch_assoc($respuestaNumClientes);
    $respuesta["numero_clientes"] = $fila["numero_clientes"];
}

// Consulta los clientes solicitados
$sqlClientes = "SELECT clientes_tb.*, clientes_sectores_tb.nombre AS sector
                FROM `clientes_tb`
                LEFT JOIN clientes_sectores_tb ON clientes_tb.id_sector = clientes_sectores_tb.id
                WHERE activo = 1 $limite";

$resultadoClientes = mysqli_query($conn, $sqlClientes);

$clientes = [];

// Para cada cliente, consulta sus contactos
while ($cliente = mysqli_fetch_assoc($resultadoClientes)) {

    $sqlContactos = "SELECT * FROM clientes_contactos_tb WHERE id_cliente = " . $cliente["id"];

    $resultadoContactos = mysqli_query($conn, $sqlContactos);
    
    $contactos = [];
    while ($contacto = mysqli_fetch_assoc($resultadoContactos)) {
        $contactos[] = $contacto;
    }

    $cliente["contactos"] = $contactos;
    $clientes[] = $cliente;
}

$respuesta["clientes"] = $clientes;

echo json_encode($respuesta);

?>
