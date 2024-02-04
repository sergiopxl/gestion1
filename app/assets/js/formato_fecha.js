"use strict"

console.log("formato_fecha.js 1.0")

const formatoFecha = new Intl.DateTimeFormat('es-ES', {
    day: "numeric",
    month: "long",
    year: "numeric"
})
const nombresDeMes = []

/**
 * Formatea un Date a una cadena de fecha española estilo `1 de mayo de 2021`.
 * @param {Date} fecha - Fecha a formatear
 * @returns Cadena de texto con la fecha formateada
 */
function formatoFechaLargo(fecha) {
    return formatoFecha.format(fecha)
}

/**
 * Devuelve la lista de los meses localizados al español.
 * @returns {String[]} Array con los nombres de los meses localizados
 */
function nombresDeMeses() {

    // Si es la primera llamada, llena el array con los nombres
    if (nombresDeMes.length == 0)
        for (let mesNum = 0; mesNum < 12; mesNum++) {
            const partes = formatoFecha.formatToParts(new Date(2000, mesNum, 1));
            const mes = partes.find(parte => parte.type === 'month').value;
            nombresDeMes.push(mes);
        }

    return nombresDeMes;
}
