<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$respuesta = [];

$condicion = " WHERE 1 ";

// Usuario por Id
$buscarPorId = false;

if (isset($_GET["id"])) {
    $buscarPorId = true;
    $idUsuario = $_GET["id"];
    $condicion .= " AND usuarios_tb.id = $idUsuario ";
}

// Consulta cuántos Usuarios hay en total
if ($buscarPorId) {
    $respuesta["numero_usuarios"] = 1;
} else {
    $sqlNumUsuarios = "SELECT COUNT(*) AS numero_usuarios FROM usuarios_tb $condicion";
    $respuestaNumUsuarios = mysqli_query($conn, $sqlNumUsuarios);

    if ($respuestaNumUsuarios) {
        $fila = mysqli_fetch_assoc($respuestaNumUsuarios);
        $respuesta["numero_usuarios"] = $fila["numero_usuarios"];
    }
}

// Consulta los Usuarios solicitados
$sqlUsuarios = "SELECT
                  usuarios_tb.id,
                  usuarios_tb.username AS nombre,
                  usuarios_tb.email,
                  usuarios_tb.avatar,
                  usuarios_permisos_tb.name AS role

                FROM `usuarios_tb`
                LEFT JOIN usuarios_permisos_tb ON usuarios_tb.id_permiso = usuarios_permisos_tb.id

                $condicion

                ORDER BY usuarios_tb.id DESC";

$resultadoUsuarios = mysqli_query($conn, $sqlUsuarios);

$Usuarios = [];

while ($cliente = mysqli_fetch_assoc($resultadoUsuarios)) {
    $Usuarios[] = $cliente;
}

$respuesta["usuarios"] = $Usuarios;

echo json_encode($respuesta);
