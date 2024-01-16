<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$sqlClientes = "SELECT * FROM `clientes_tb` WHERE activo = 1";
$resultadoClientes = mysqli_query($conn, $sqlClientes);

// var_dump($resultadoClientes);

$clientes = [];

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

echo json_encode($clientes);

?>
