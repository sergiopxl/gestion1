"use strict"

console.log("formato_fecha.js 1.0")

//
// Formatea un Date a una cadena de fecha española estilo "1 de mayo de 2021".
//
function formatoFechaLargo(fecha) {

    const formatoFecha = new Intl.DateTimeFormat('es-ES', {
        day: "numeric",
        month: "long",
        year: "numeric"
    })
    return formatoFecha.format(fecha)
}
