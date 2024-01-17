<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$sqlSectores = "SELECT clientes_sectores_tb.* FROM clientes_sectores_tb";
$resultadoSectores = mysqli_query($conn, $sqlSectores);

$sectores = [];

while ($sector = mysqli_fetch_assoc($resultadoSectores)) {
    $sectores[] = $sector;
}

echo json_encode($sectores);
