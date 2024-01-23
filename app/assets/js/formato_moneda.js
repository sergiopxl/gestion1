"use strict"

console.log("formato_moneda.js 1.1")

function formatoMoneda(numero) {

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
