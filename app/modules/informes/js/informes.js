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
            .catch(error => {
                console.error("Error cargando las estadísticas: " + error)
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
                            totalFacturas: parseFloat(facturacion["total_facturas"]),
                            fechaInicio: new Date(facturacion["fecha_inicio"]),
                            fechaFin: new Date(facturacion["fecha_fin"])
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
                            totalGastos: parseFloat(gastos["total_gastos"]),
                            fechaInicio: new Date(gastos["fecha_inicio"]),
                            fechaFin: new Date(gastos["fecha_fin"])
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
            const contenedorResumen = document.querySelector("#informes-resumen")

            // Total de facturas, gastos y diferencia (beneficio)
            const pTotalFacturas = contenedorResumen.querySelector("#total-facturas")
            const pTotalGastos = contenedorResumen.querySelector("#total-gastos")
            const pTotalBeneficio = contenedorResumen.querySelector("#total-beneficio")

            const facturado = facturacion["totalFacturas"]
            pTotalFacturas.textContent = formatoMoneda(facturado)
            const gastado = gastos["totalGastos"]
            pTotalGastos.textContent = formatoMoneda(gastado)

            const beneficio = facturado - gastado
            pTotalBeneficio.textContent = formatoMoneda(beneficio)

            // Fechas de inicio y fin
            const fechaInicioFacturas = facturacion["fechaInicio"]
            const fechaInicioGastos = gastos["fechaInicio"]
            const fechaInicio = fechaInicioFacturas < fechaInicioGastos ? fechaInicioFacturas : fechaInicioGastos
            
            const spanFechaInicio = contenedorResumen.querySelector("#informe-fecha-inicio")
            spanFechaInicio.textContent = formatoFechaLargo(fechaInicio)
            
            const fechaFinFacturas = facturacion["fechaFin"]
            const fechaFinGastos = gastos["fechaFin"]
            const fechaFin = fechaFinFacturas > fechaFinGastos ? fechaFinFacturas : fechaFinGastos
            
            const spanFechaFin = contenedorResumen.querySelector("#informe-fecha-fin")
            spanFechaFin.textContent = formatoFechaLargo(fechaFin)

            contenedorResumen.classList.remove("hidden")
        }
    }

    getEstadisticas()
}

doInformes()
