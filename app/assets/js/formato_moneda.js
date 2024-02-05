console.log("formato_moneda.js 1.2")

/**
 * Devuelve una cadena de texto con el número pasado formateado como moneda, localizado para
 * español de España.
 * 
 * @param {number} numero - Valor a formatear como moneda.
 * @returns Cadena de texto que representa al valor indicado como moneda (p.ej. `9.123,45 €`).
 */
export function formatoMoneda(numero) {

    // Formatea como moneda española
    const formatoMoneda = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    })

    // Devuelve el número formateado como cadena
    return formatoMoneda.format(numero)
}
