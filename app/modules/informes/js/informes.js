"use strict"

console.log("informes.js v1.0")

function doInformes() {

    //
    // Carga las estadísticas de Facturas y Gastos para poder realizar informes y gráficos.
    //
    function getEstadisticas() {

        Promise.all([cargarDatosFacturacion(), cargarDatosGastos()])
            .then(([datosFacturacion, datosGastos]) => {
                printResumen(datosFacturacion, datosGastos)
            })
            .catch(([errorFacturas, errorGastos]) => {
                if (errorFacturas)
                    console.log("Error cargando las estadísticas de facturación: " + errorFacturas)
                if (errorGastos)
                    console.log("Error cargando las estadísticas de gastos: " + errorGastos)
            })

        //
        // Carga los datos estadísticos de facturación de forma asíncrona.
        //
        function cargarDatosFacturacion() {
            return new Promise((resolve, reject) => {

                fetch(`${apiUrlFacturasGet}?estadisticas`, { method: "GET" })
                    .then(respuesta => {
                        if (!respuesta.ok)
                            throw new Error(`Error en la solicitud: ${respuesta.status}`)

                        else return respuesta.json()
                    })
                    .then(facturacion => {
                        resolve({
                            totalFacturas: facturacion["total_facturas"],
                            fechaInicio: facturacion["fecha_inicio"],
                            fechaFin: facturacion["fecha_fin"]
                        })
                    })
                    .catch(error => {
                        const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
                        reject(error)
                    })
            })
        }

        //
        // Carga los datos estadísticos de gastos de forma asíncrona.
        //
        function cargarDatosGastos() {
            return new Promise((resolve, reject) => {

                fetch(`${apiUrlGastosGet}?estadisticas`, { method: "GET" })
                    .then(respuesta => {
                        if (!respuesta.ok)
                            throw new Error(`Error en la solicitud: ${respuesta.status}`)

                        else return respuesta.json()
                    })
                    .then(gastos => {
                        resolve({
                            totalGastos: gastos["total_gastos"],
                            fechaInicio: gastos["fecha_inicio"],
                            fechaFin: gastos["fecha_fin"]
                        })
                    })
                    .catch(error => {
                        const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
                        reject(mensajeError)
                    })
            })
        }

        //
        // Imprime los datos estadísticos en el resumen de facturas, gastos y beneficio, así como
        // las fechas de inicio y fin de facturación.
        //
        function printResumen(facturacion, gastos) {
            const contenedorResumen = document.querySelector("#resumen-beneficio")

            const pTotalFacturas = contenedorResumen.querySelector("#total-facturas")
            const pTotalGastos = contenedorResumen.querySelector("#total-gastos")
            const pTotalBeneficio = contenedorResumen.querySelector("#total-beneficio")

            const facturado = parseFloat(facturacion["totalFacturas"])
            pTotalFacturas.textContent = formatoMoneda(facturado)
            const gastado = parseFloat(gastos["totalGastos"])
            pTotalGastos.textContent = formatoMoneda(gastado)

            const beneficio = facturado - gastado
            pTotalBeneficio.textContent = formatoMoneda(beneficio)
        }
    }

    getEstadisticas()
}

doInformes()
