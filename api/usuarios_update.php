<?php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, X-User-ID, X-Token, Accept, Accept-Encoding");
header("Access-Control-Allow-Methods: GET");

include("conn/conexion.php");

$dirAvatares = "../app/assets/avatares/";   // Ruta donde guardar las imágenes de Usuario
$urlBaseDb = "../../assets/avatares/";      // URL base de las imágenes de Usuario para añadir a la base de datos

// Por defecto, si no se ha subido archivo, no hay URL de avatar
$urlImagenParaBd = "";

// Verifica si se ha enviado un archivo
if (isset($_FILES['archivo'])) {

    $archivoNombre = $_FILES['archivo']['name'];
    $archivoTipo = $_FILES['archivo']['type'];
    $archivoTamaño = $_FILES['archivo']['size'];

    $rutaTemp = $_FILES['archivo']['tmp_name'];

    $nombreUnico = uniqid() . '_' . $archivoNombre;

    $rutaFisicaFinal = $dirAvatares . $nombreUnico;
    $urlImagenParaBd = $urlBaseDb . $nombreUnico;

    // Movemos la imagen de su ruta temporal al almacén de avatares
    move_uploaded_file($rutaTemp, $rutaFisicaFinal);
}

// Obtiene el resto de datos del Usuario
$usuarioId = $_POST["usuario-id"];
$nombre = $_POST["usuario-nombre"];
$email = $_POST["usuario-email"];
$contraseña = md5($_POST["usuario-password"]);   // La contraseña se almacena como hash MD5

// Actualiza el usuario en la base de datos
$sqlInsertUsuario = "UPDATE usuarios_tb SET
                       username = '$nombre',
                       email = '$email',
                       password = '$contraseña',
                       avatar = '$urlImagenParaBd',
                       id_permiso = 1

                     WHERE id = $usuarioId";

$resultadoUsuarios = mysqli_query($conn, $sqlInsertUsuario);

echo json_encode($resultadoUsuarios
    ? "El usuario ha sido actualizado."
    : "Ha habido un problema");
