<?php

include("conn/parameters.php");

$conn = mysqli_connect(HOST, USER, PASSWORD, DATABASE) or die("No se puede conectar a la base de datos");
mysqli_select_db($conn, DATABASE);
mysqli_set_charset($conn,"UTF8");

if ($conn->connect_error) {
    die("La conexión ha fallado: " . $conn->connect_error);
} else {
    // echo "<div>La conexión a la base de datos ha tenido éxito</div>";
}
