"use strict"

console.log("informes.js v1.0")

function doInformes() {

    let fechaInicio = new Date(0)
    let fechaFin = new Date(0)

    //
    // Carga las estadísticas de Facturas y Gastos para poder realizar informes y gráficos.
    //
    function getEstadisticas() {

        Promise.all([cargarDatosFacturacion(), cargarDatosGastos()])
            .then(([datosFacturacion, datosGastos]) => {

                getRangoDeFechas(datosFacturacion, datosGastos)
                printResumen(datosFacturacion, datosGastos)
                printGrafico(datosFacturacion, datosGastos)
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
                            fechaFin: new Date(facturacion["fecha_fin"]),
                            facturasPorFecha: facturacion["facturas_por_fecha"]
                        })
                    })
                    .catch(error => {
                        const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
                        reject(mensajeError)
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
                            fechaFin: new Date(gastos["fecha_fin"]),
                            gastosPorFecha: gastos["gastos_por_fecha"]
                        })
                    })
                    .catch(error => {
                        const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
                        reject(mensajeError)
                    })
            })
        }

        //
        // A partir de los datos de facturación y gastos, determina el intervalo de fechas que comprenden
        // los datos.
        //
        function getRangoDeFechas(facturacion, gastos) {
            
            const fechaInicioFacturas = facturacion["fechaInicio"]
            const fechaInicioGastos = gastos["fechaInicio"]
            
            fechaInicio = fechaInicioFacturas < fechaInicioGastos ? fechaInicioFacturas : fechaInicioGastos

            const fechaFinFacturas = facturacion["fechaFin"]
            const fechaFinGastos = gastos["fechaFin"]

            fechaFin = fechaFinFacturas > fechaFinGastos ? fechaFinFacturas : fechaFinGastos
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
            const spanFechaInicio = contenedorResumen.querySelector("#informe-fecha-inicio")
            spanFechaInicio.textContent = formatoFechaLargo(fechaInicio)
            
            const spanFechaFin = contenedorResumen.querySelector("#informe-fecha-fin")
            spanFechaFin.textContent = formatoFechaLargo(fechaFin)

            contenedorResumen.classList.remove("hidden")
        }

        //
        // Imprime el gráfico de evolución de facturas y gastos.
        //
        function printGrafico(facturacion, gastos) {
            const contenedorGrafico = document.querySelector("#informes-graficos > div.grafico")

            // Crea el elemento raíz del gráfico (https://www.amcharts.com/docs/v5/getting-started/#Root_element)
            let root = am5.Root.new(contenedorGrafico)

            const tema = am5.Theme.new(root)
            tema.rule("AxisLabel", ["minor"]).setAll({ dy: 1 })             // Mueve la etiqueta menor un poco hacia abajo
            tema.rule("Grid", ["minor"]).setAll({ strokeOpacity: 0.08 })    // Ajusta la opacidad de la rejilla menor

            // Establece el tema a usar (https://www.amcharts.com/docs/v5/concepts/themes/)
            root.setThemes([ am5themes_Animated.new(root), tema ])

            // Crea el formateador de moneda y la localización española
            root.numberFormatter.set("numberFormat", "#.###,00' €'");
            root.locale = am5locales_es_ES;

            // Crea el gráfico (https://www.amcharts.com/docs/v5/charts/xy-chart/)
            let chart = root.container.children.push(
                am5xy.XYChart.new(root, {
                    panX: false,
                    panY: false,
                    wheelX: "panX",
                    wheelY: "zoomX",
                    paddingLeft: 0
                    }))

            // Configura el cursor (https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/)
            let cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "zoomX" }))
            cursor.lineY.set("visible", false)

            // Crea los ejes (https://www.amcharts.com/docs/v5/charts/xy-chart/axes/)
            let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
                maxDeviation: 0,
                baseInterval: { timeUnit: "day", count: 1 },
                renderer: am5xy.AxisRendererX.new(root, {
                    minorGridEnabled: true,
                    minGridDistance: 200,    
                    minorLabelsEnabled: true
                }),
                tooltip: am5.Tooltip.new(root, { })
            }))
            xAxis.set("minorDateFormats", { day: "dd", month: "MM" })

            let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, { })
            }))

            // Añade las series a representar (https://www.amcharts.com/docs/v5/charts/xy-chart/series/)
            let serieFacturas = agregarDatosFacturas()
            let serieGastos = agregarDatosGastos()

            // Crea la barra de scroll (https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/)
            chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }))

            // Inicia una animación al aparecer el gráfico (https://www.amcharts.com/docs/v5/concepts/animations/)
            contenedorGrafico.classList.remove("hidden")
            serieFacturas.appear(1000)
            serieGastos.appear(1000)
            chart.appear(1000, 100)

            //
            // Crea la serie de datos de facturas para el gráfico.
            //
            function agregarDatosFacturas() {

                let serieFacturas = chart.series.push(
                    am5xy.LineSeries.new(root, {
                        name: "Facturas",
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: "value",
                        valueXField: "fecha",
                        fill: am5.color(0x409000),
                        stroke: am5.color(0x409000),
                        tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
                    }))
    
                // Viñetas
                serieFacturas.bullets.push(function () {
                    let bulletCircle = am5.Circle.new(root, { radius: 5, fill: serieFacturas.get("fill") })
                    return am5.Bullet.new(root, { sprite: bulletCircle })
                })

                let datos = []
                for (let facturaMasFecha of facturacion["facturasPorFecha"]) {
                    datos.push({
                        fecha: new Date(facturaMasFecha.fecha).getTime(),
                        value: parseFloat(facturaMasFecha.facturado)
                    })
                }

                serieFacturas.data.setAll(datos)

                return serieFacturas
            }

            //
            // Crea la serie de datos de gastos para el gráfico.
            //
            function agregarDatosGastos() {

                let serieGastos = chart.series.push(
                    am5xy.LineSeries.new(root, {
                        name: "Gastos",
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: "value",
                        valueXField: "fecha",
                        fill: am5.color(0x910000),
                        stroke: am5.color(0x910000),
                        tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
                    }))
    
                // Viñetas
                serieGastos.bullets.push(function () {
                    let bulletCircle = am5.Circle.new(root, { radius: 5, fill: serieGastos.get("fill") })
                    return am5.Bullet.new(root, { sprite: bulletCircle })
                })

                let datos = []
                for (let gastoMasFecha of gastos["gastosPorFecha"]) {
                    datos.push({
                        fecha: new Date(gastoMasFecha.fecha).getTime(),
                        value: parseFloat(gastoMasFecha.gastado)
                    })
                }

                serieGastos.data.setAll(datos)

                return serieGastos
            }
        }
    }

    getEstadisticas()
}

doInformes()
