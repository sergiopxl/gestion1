console.log("formato_fecha.js 1.1")

/**
 * Formato de fecha preconfigurado para convertir fechas al formato localizado en español
 * de España en formato largo (p.ej. `1 de mayo de 2021`).
 */
const formatoFechaLargo = new Intl.DateTimeFormat('es-ES', {
    day: "numeric",
    month: "long",
    year: "numeric"
})
/**
 * Formato de fecha preconfigurado para convertir fechas al formato localizado en español
 * de España en formato corto (p.ej. `1 de mayo de 2021`).
 */
const formatoFechaCorto = new Intl.DateTimeFormat('es-ES', {
    day: "numeric",
    month: "numeric",
    year: "numeric"
})

const nombresDeMes = []

/**
 * Formatea un Date a una cadena de fecha española estilo `1 de mayo de 2021`.
 * @param {Date} fecha - Fecha a formatear
 * @returns Cadena de texto con la fecha formateada
 */
export function fechaLarga(fecha) {
    return formatoFechaLargo.format(fecha)
}

/**
 * Formatea un Date a una cadena de fecha española estilo `1/5/2021`.
 * @param {Date} fecha - Fecha a formatear
 * @returns Cadena de texto con la fecha formateada
 */
export function fechaCorta(fecha) {
    return formatoFechaCorto.format(fecha)
}

/**
 * Devuelve la lista de los meses localizados al español.
 * @returns {String[]} Array con los nombres de los meses localizados
 */
export function nombresDeMeses() {

    // Si es la primera llamada, llena el array con los nombres
    if (nombresDeMes.length == 0)
        for (let mesNum = 0; mesNum < 12; mesNum++) {
            const partes = formatoFechaLargo.formatToParts(new Date(2000, mesNum, 1));
            const mes = partes.find(parte => parte.type === 'month').value;
            nombresDeMes.push(mes);
        }

    return nombresDeMes;
}
