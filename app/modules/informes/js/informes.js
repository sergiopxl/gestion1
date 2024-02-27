import { navegacion } from "../../../assets/js/navegacion.js"
import { formatoMoneda } from "../../../assets/js/formato_moneda.js"
import { fechaLarga, nombresDeMeses } from "../../../assets/js/formato_fecha.js"
import { Modal } from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("informes.js v1.1")

navegacion("informes")

let fechaInicio = new Date(0)
let fechaInicioSeleccionada = fechaInicio
let fechaFin = new Date(0)
let fechaFinSeleccionada = fechaFin

let rootGraficoBeneficios
let rootGraficoBeneficiosMes
let rootGraficoFacturasPorCliente
let rootGraficoGastosPorProveedor

const plantillaSelectorFechas = document.querySelector("#selector-fechas")

//
// Carga las estadísticas de Facturas y Gastos para poder realizar informes y gráficos.
//
async function getEstadisticas() {

    await cargarDatosEstadisticos()

    //
    // Muestra un resumen de gastos y facturaciones y gráficos con estadísticas de interés.
    //
    async function cargarDatosEstadisticos(fechaInicio, fechaFin) {
        let datosEstadisticos

        try {
            datosEstadisticos = await Promise.all([
                cargarDatosFacturacion(fechaInicio, fechaFin),
                cargarDatosGastos(fechaInicio, fechaFin),
                cargarDatosFacturacionPorCliente(fechaInicio, fechaFin),
                cargarDatosGastosPorProveedor(fechaInicio, fechaFin),
            ])
        }
        catch (error) {
            console.error("Error cargando las estadísticas: " + error)
        }

        const [datosFacturacion, datosGastos, datosFacturacionPorCliente, datosGastosPorProveedor] = datosEstadisticos

        mostrarResumenConGraficos(datosFacturacion, datosGastos, datosFacturacionPorCliente, datosGastosPorProveedor)
    }

    //
    // Destruye los gráficos previo a que sean recreados.
    //
    function destruirGraficos() {

        destruirGraficoBeneficios()
        destruirGraficoBeneficiosPorMes()
        destruirGraficoFacturacionPorCliente()
        destruirGraficoGastosPorProveedor()
    }

    //
    // Muestra un resumen de gastos y facturaciones y gráficos con estadísticas de interés.
    //
    function mostrarResumenConGraficos(datosFacturacion, datosGastos,
                                       datosFacturacionPorCliente, datosGastosPorProveedor) {

        getRangoDeFechas(datosFacturacion, datosGastos)

        printResumen(datosFacturacion, datosGastos)
        printGraficoBeneficios(datosFacturacion, datosGastos)
        printGraficoBeneficiosPorMes(datosFacturacion, datosGastos)

        printGraficoFacturacionPorCliente(datosFacturacionPorCliente)
        printGraficoGastosPorProveedor(datosGastosPorProveedor)
    }

    // === Resumen de Facturas / Gastos y Fechas ================================================

    //
    // Carga los datos estadísticos de facturación de forma asíncrona.
    //
    async function cargarDatosFacturacion(fechaInicio, fechaFin) {

        try {
            const datosFacturacion = await datos.cargarFacturacionPorFecha(fechaInicio, fechaFin)
            return datosFacturacion
        }
        catch (error) {
            const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
            throw new Error(mensajeError)
        }
    }

    //
    // Carga los datos estadísticos de gastos de forma asíncrona.
    //
    async function cargarDatosGastos(fechaInicio, fechaFin) {

        try {
            const datosGastos = await datos.cargarGastosPorFecha(fechaInicio, fechaFin)
            return datosGastos
        }
        catch (error) {
            const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
            throw new Error(mensajeError)
        }
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

        fechaInicioSeleccionada = fechaInicio
        fechaFinSeleccionada = fechaFin

        const botonSelectorFechas = document.querySelector("#boton-cambiar-fechas")
        botonSelectorFechas.addEventListener("click", e => {
            e.preventDefault()
            mostrarDialogoDeElegirFechas()
        })
        botonSelectorFechas.classList.remove("hidden")
    }

    //
    // Muestra un diálogo modal para que el usuario elija las fechas de inicio y fin
    // de las estadísticas.
    //
    function mostrarDialogoDeElegirFechas() {

        // Clonamos la interfaz del buscador
        const interfazSelectorFecha = plantillaSelectorFechas.cloneNode(true)
        interfazSelectorFecha.setAttribute("id", "")
        interfazSelectorFecha.classList.remove("hidden")

        const campoFechaInicio = interfazSelectorFecha.querySelector("#fecha-inicio")
        campoFechaInicio.valueAsDate = fechaInicioSeleccionada
        const campoFechaFin = interfazSelectorFecha.querySelector("#fecha-fin")
        campoFechaFin.valueAsDate = fechaFinSeleccionada

        // Creamos un modal con dicha interfaz
        const opcionesModal = {
            class: "selector-fechas-modal",
            mostrarBotonAceptar: true,
            mostrarBotonCancelar: true
        }
        const modalSelectorFechas = new Modal(interfazSelectorFecha, () => {

            // Cuando el usuario acepta, establecemos la selección de fechas y recargamos los informes
            fechaInicioSeleccionada = campoFechaInicio.valueAsDate
            fechaFinSeleccionada = campoFechaFin.valueAsDate

            destruirGraficos()
            cargarDatosEstadisticos(fechaInicioSeleccionada, fechaFinSeleccionada)
        },
        null, opcionesModal)
        modalSelectorFechas.mostrar()
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
        spanFechaInicio.textContent = fechaLarga(fechaInicio)

        const spanFechaFin = contenedorResumen.querySelector("#informe-fecha-fin")
        spanFechaFin.textContent = fechaLarga(fechaFin)

        contenedorResumen.classList.remove("hidden")
    }

    // === Estadísticas de Facturas / Gastos / Beneficios =======================================

    //
    // Imprime el gráfico de evolución de facturas y gastos.
    //
    function printGraficoBeneficios(facturacion, gastos) {
        const contenedorGrafico = document.querySelector("#grafico-beneficios")

        // Crea el elemento raíz del gráfico (https://www.amcharts.com/docs/v5/getting-started/#Root_element)
        let root = am5.Root.new(contenedorGrafico)
        rootGraficoBeneficios = root

        const tema = am5.Theme.new(root)
        tema.rule("AxisLabel", ["minor"]).setAll({ dy: 1 })             // Mueve la etiqueta menor un poco hacia abajo
        tema.rule("Grid", ["minor"]).setAll({ strokeOpacity: 0.08 })    // Ajusta la opacidad de la rejilla menor

        // Establece el tema a usar (https://www.amcharts.com/docs/v5/concepts/themes/)
        root.setThemes([ am5themes_Animated.new(root), tema ])

        // Crea el formateador de moneda y la localización española
        root.numberFormatter.set("numberFormat", "#.###,00' €'")
        root.locale = am5locales_es_ES

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
        const { datosFacturas, datosGastos, datosBeneficio } = crearDatos()
        let serieFacturas = agregarDatosFacturas(datosFacturas)
        let serieGastos = agregarDatosGastos(datosGastos)
        let serieBeneficio = agregarDatosBeneficio(datosBeneficio)

        // Crea la barra de scroll (https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/)
        chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }))

        // Inicia una animación al aparecer el gráfico (https://www.amcharts.com/docs/v5/concepts/animations/)
        contenedorGrafico.classList.remove("hidden")
        serieFacturas.appear(1000)
        serieGastos.appear(1000)
        serieBeneficio.appear(1000)
        chart.appear(1000, 100)

        //
        // Crea los datos de facturas, gastos y beneficio para que sirva para las series del gráfico.
        // Devuelve un objeto `{ facturas, gastos, beneficio }`.
        //
        function crearDatos() {

            let movimientos = []

            let datosFacturas = []
            for (let facturaMasFecha of facturacion["facturasPorFecha"]) {

                const fecha = facturaMasFecha.fecha
                const facturado = parseFloat(facturaMasFecha.facturado)

                datosFacturas.push({
                    fecha: new Date(fecha).getTime(),
                    value: facturado
                })

                // Anota lo facturado como positivo
                movimientos.push([fecha, facturado])
            }

            let datosGastos = []
            for (let gastoMasFecha of gastos["gastosPorFecha"]) {

                const fecha = gastoMasFecha.fecha
                const gastado = parseFloat(gastoMasFecha.gastado)

                datosGastos.push({
                    fecha: new Date(fecha).getTime(),
                    value: gastado
                })

                // Anota los gastos como negativo
                movimientos.push([fecha, -gastado])
            }

            // Contabiliza todos los movimientos por fecha
            let beneficios = {}
            let balance = 0
            for (let [fecha, movimiento] of movimientos.toSorted()) {

                balance += movimiento
                beneficios[fecha] = balance
            }

            let datosBeneficio = []
            for (const [fecha, beneficio] of Object.entries(beneficios)) {
                datosBeneficio.push({
                    fecha: new Date(fecha).getTime(),
                    value: beneficio
                })
            }

            return { datosFacturas, datosGastos, datosBeneficio }
        }

        //
        // Crea la serie de datos de facturas para el gráfico.
        //
        function agregarDatosFacturas(datosFacturas) {

            let serieFacturas = chart.series.push(
                am5xy.LineSeries.new(root, {
                    name: "Facturas",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "value",
                    valueXField: "fecha",
                    fill: am5.color(0x409000),      // Verde
                    stroke: am5.color(0x409000),
                    tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
                }))

            // Viñetas
            serieFacturas.bullets.push(function () {
                let bulletCircle = am5.Circle.new(root, { radius: 5, fill: serieFacturas.get("fill") })
                return am5.Bullet.new(root, { sprite: bulletCircle })
            })

            serieFacturas.data.setAll(datosFacturas)

            return serieFacturas
        }

        //
        // Crea la serie de datos de gastos para el gráfico.
        //
        function agregarDatosGastos(datosGastos) {

            let serieGastos = chart.series.push(
                am5xy.LineSeries.new(root, {
                    name: "Gastos",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "value",
                    valueXField: "fecha",
                    fill: am5.color(0x910000),      // Rojo
                    stroke: am5.color(0x910000),
                    tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
                }))

            // Viñetas
            serieGastos.bullets.push(function () {
                let bulletCircle = am5.Circle.new(root, { radius: 5, fill: serieGastos.get("fill") })
                return am5.Bullet.new(root, { sprite: bulletCircle })
            })

            serieGastos.data.setAll(datosGastos)

            return serieGastos
        }

        //
        // Crea la serie de datos de beneficio para el gráfico.
        //
        function agregarDatosBeneficio(datosBeneficio) {

            let serieBeneficio = chart.series.push(
                am5xy.SmoothedXLineSeries.new(root, {
                    name: "Beneficio",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "value",
                    valueXField: "fecha",
                    fill: am5.color(0x20B0D0),      // Azul
                    stroke: am5.color(0x20B0D0),
                    tooltip: am5.Tooltip.new(root, {
                        labelText: "{valueX.formatDate()}: {valueY}",
                        pointerOrientation: "horizontal"
                    })
                }))

            // Estilo de línea y área
            serieBeneficio.strokes.template.setAll({ strokeWidth: 3 })
            serieBeneficio.fills.template.setAll({ fillOpacity: 0.5, visible: true })

            // Intervalos (-inf, 0) en rojo y [0, +inf) en azul
            var rangoNegativo = yAxis.makeDataItem({ value: -1000000000, endValue: 0 })
            var range = serieBeneficio.createAxisRange(rangoNegativo)

            range.strokes.template.setAll({ stroke: am5.color(0xff621f), strokeWidth: 3 })
            range.fills.template.setAll({
                fill: am5.color(0xff621f),
                fillOpacity: 0.5,
                visible: true
            })

            serieBeneficio.data.setAll(datosBeneficio)

            return serieBeneficio
        }
    }

    //
    // Destruye el gráfico de evolución de facturas y gastos.
    //
    function destruirGraficoBeneficios() {
        const contenedorGrafico = document.querySelector("#grafico-beneficios")

        rootGraficoBeneficios?.dispose()
        rootGraficoBeneficios = null

        contenedorGrafico.innerHTML = ""
        contenedorGrafico.classList.add("hidden")
    }

    // === Estadísticas de beneficio por meses ====================================================

    //
    // Imprime el gráfico de categorización de facturas y gastos por meses.
    //
    function printGraficoBeneficiosPorMes(facturacion, gastos) {
        const contenedorGrafico = document.querySelector("#grafico-beneficios-mes")

        // Crea el elemento raíz del gráfico (https://www.amcharts.com/docs/v5/getting-started/#Root_element)
        let root = am5.Root.new(contenedorGrafico)
        rootGraficoBeneficiosMes = root

        // Establece el tema a usar (https://www.amcharts.com/docs/v5/concepts/themes/)
        root.setThemes([am5themes_Animated.new(root)])

        // Crea el formateador de moneda y la localización española
        root.numberFormatter.set("numberFormat", "#.###,00' €'")
        root.locale = am5locales_es_ES

        // Crea el gráfico (https://www.amcharts.com/docs/v5/charts/xy-chart/)
        let chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                paddingLeft: 0,
                paddingRight: 1
            }))

        // Configura el cursor (https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/)
        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}))
        cursor.lineY.set("visible", false)

        // Crea los ejes (https://www.amcharts.com/docs/v5/charts/xy-chart/axes/)
        var xRenderer = am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
            minorGridEnabled: true
        });
        xRenderer.labels.template.setAll({
            rotation: -90,
            centerY: am5.p50,
            centerX: am5.p100,
            paddingRight: 15
        });
        xRenderer.grid.template.setAll({ location: 1 })

        let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0.3,
            categoryField: "mes",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {})
        }))

        var yRenderer = am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0.3,
            renderer: yRenderer
        }));

        // Añade las series a representar (https://www.amcharts.com/docs/v5/charts/xy-chart/series/)
        const datos = crearDatos()
        let serieGastos = agregarDatosGastos(datos)
        let serieFacturas = agregarDatosFacturas(datos)

        // Inicia una animación al aparecer el gráfico (https://www.amcharts.com/docs/v5/concepts/animations/)
        contenedorGrafico.classList.remove("hidden")
        serieGastos.appear(1000)
        serieFacturas.appear(1000)
        chart.appear(1000, 100)

        //
        // Crea los datos de facturas y gastos categorizados por mes para que sirva para
        // las series del gráfico.
        //
        function crearDatos() {

            const nombreMes = nombresDeMeses()

            let facturasPorMes = []
            let gastosPorMes = []

            for (let facturaMasFecha of facturacion["facturasPorFecha"]) {

                const mes = new Date(facturaMasFecha.fecha).getMonth()
                const facturado = parseFloat(facturaMasFecha.facturado)

                facturasPorMes[mes] = (facturasPorMes[mes] ?? 0) + facturado

                // Factura devuelta: contabilizamos como gasto para el gráfico
                if (facturado < 0)
                    gastosPorMes[mes] = (gastosPorMes[mes] ?? 0) + facturado
            }
            for (let gastoMasFecha of gastos["gastosPorFecha"]) {

                const mes = new Date(gastoMasFecha.fecha).getMonth()
                const gastado = parseFloat(gastoMasFecha.gastado)

                gastosPorMes[mes] = (gastosPorMes[mes] ?? 0) - gastado
            }

            let datosFacturas = []
            for (let mes = 0; mes < 12; mes++) {
                if (facturasPorMes[mes] || gastosPorMes[mes])
                    datosFacturas.push({
                        mes: nombreMes[mes],
                        facturado: facturasPorMes[mes] ?? 0,
                        gastado: gastosPorMes[mes] ?? 0
                    })
            }

            return datosFacturas
        }

        //
        // Crea la serie de datos de facturas para el gráfico.
        // Ésta se dibujará normalmente en verde. Sin embargo, para facturas devueltas (que cuentan como
        // negativo), si el volumen total facturado para el mes es negativo, se dibujará como valor
        // negativo en color anaranjado (para distinguirlo de los gastos).
        //
        function agregarDatosFacturas(datosFacturas) {

            let serieFacturas = chart.series.push(
                am5xy.ColumnSeries.new(root, {
                    name: "Facturas",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "facturado",
                    sequencedInterpolation: true,
                    categoryXField: "mes",
                    clustered: false,
                    fill: am5.color(0x409000),      // Verde
                    stroke: am5.color(0x409000),
                    tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: [bold]{valueY}[/]" })
                }))

            // Intervalos (-inf, 0) en naranja y [0, +inf) en verde
            var rangoNegativo = yAxis.makeDataItem({ value: -1000000000, endValue: 0 })
            var range = serieFacturas.createAxisRange(rangoNegativo)

            range.columns.template.setAll({ stroke: am5.color(0x914d00), fill: am5.color(0x914d00) })

            serieFacturas.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });

            xAxis.data.setAll(datosFacturas)
            serieFacturas.data.setAll(datosFacturas)

            return serieFacturas
        }

        //
        // Crea la serie de datos de gastos para el gráfico.
        //
        function agregarDatosGastos(datosGastos) {

            let serieGastos = chart.series.push(
                am5xy.ColumnSeries.new(root, {
                    name: "Gastos",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "gastado",
                    sequencedInterpolation: true,
                    categoryXField: "mes",
                    clustered: false,
                    fill: am5.color(0x910000),      // Rojo
                    stroke: am5.color(0x910000),
                    tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: [bold]{valueY}[/]" })
                }))

            serieGastos.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });

            xAxis.data.setAll(datosGastos)
            serieGastos.data.setAll(datosGastos)

            return serieGastos
        }
    }

    //
    // Destruye el gráfico de evolución de facturas y gastos por meses.
    //
    function destruirGraficoBeneficiosPorMes() {
        const contenedorGrafico = document.querySelector("#grafico-beneficios-mes")

        rootGraficoBeneficiosMes?.dispose()
        rootGraficoBeneficiosMes = null

        contenedorGrafico.innerHTML = ""
        contenedorGrafico.classList.add("hidden")
    }

    // === Estadísticas de Clientes que más facturan ==============================================

    //
    // Carga los datos estadísticos de facturas agrupadas por cliente de forma asíncrona.
    //
    async function cargarDatosFacturacionPorCliente(fechaInicio, fechaFin) {

        try {
            const datosFacturasPorCliente = await datos.cargarDatosFacturacionPorCliente(fechaInicio, fechaFin)
            return datosFacturasPorCliente
        }
        catch (error) {
            const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
            throw new Error(mensajeError)
        }
    }

    //
    // Imprime el gráfico de clientes que más facturan.
    //
    function printGraficoFacturacionPorCliente(clientes) {
        const contenedorGrafico = document.querySelector("#grafico-clientes")

        // Crea el elemento raíz del gráfico (https://www.amcharts.com/docs/v5/getting-started/#Root_element)
        let root = am5.Root.new(contenedorGrafico)
        rootGraficoFacturasPorCliente = root

        // Establece el tema a usar (https://www.amcharts.com/docs/v5/concepts/themes/)
        root.setThemes([ am5themes_Animated.new(root) ])

        // Crea el formateador de moneda y la localización española
        root.numberFormatter.set("numberFormat", "#.###,00' €'")
        root.locale = am5locales_es_ES

        // Crea el gráfico (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/)
        var chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                layout: root.verticalLayout,
                innerRadius: am5.percent(50)
            }))

        // Añade la serie a representar (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series)
        const datosClientes = crearDatos(clientes)
        let serie = agregarDatosClientes(datosClientes)

        // Crea la leyenda del gráfico (https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/)
        var leyenda = chart.children.push(
            am5.Legend.new(root, {
                x: am5.percent(50),
                centerX: am5.percent(50),
                marginTop: 15,
                marginBottom: 15
            }))
        leyenda.data.setAll(serie.dataItems)

        // Inicia una animación al aparecer el gráfico (https://www.amcharts.com/docs/v5/concepts/animations/)
        contenedorGrafico.classList.remove("hidden")
        serie.appear(1000, 100)

        //
        // Crea los datos de facturas agrupadas por cliente para los clientes más relevantes
        // y crea también un cliente "Otros" con los menos relevantes, para que sirva para las
        // series del gráfico.
        // Devuelve un array de objetos `[ { nombre, total_facturado }, ... ]`.
        //
        function crearDatos(clientes) {

            const MIN_FACTURADO_CLIENTE = 1000

            let datosClientesRelevantes = clientes
                .filter(cliente => parseFloat(cliente.total_facturado) >= MIN_FACTURADO_CLIENTE)

            let datosOtrosClientes = clientes
                .filter(cliente => parseFloat(cliente.total_facturado) < MIN_FACTURADO_CLIENTE)
                .reduce((acumulado, cliente) => {
                    return {
                        nombre: "Otros",
                        total_facturado: parseFloat(acumulado.total_facturado)
                                       + parseFloat(cliente.total_facturado)
                    }},
                    { nombre: "Otros", total_facturado: 0 })

            datosClientesRelevantes.push(datosOtrosClientes)

            datosClientesRelevantes = datosClientesRelevantes.map(cliente => {
                return {
                    facturado: parseFloat(cliente.total_facturado),
                    nombre: cliente.nombre
                }})

            return datosClientesRelevantes
        }

        //
        // Crea la serie de datos de facturas para el gráfico.
        //
        function agregarDatosClientes(datosClientes) {

            var serie = chart.series.push(
                am5percent.PieSeries.new(root, {
                    valueField: "facturado",
                    categoryField: "nombre",
                    legendValueText: ""         // En la leyenda omite el valor (%)
            }))

            root.tooltipContainer.children.push(
                am5.Label.new(root, {
                    x: am5.p50,
                    y: am5.p50,
                    centerX: am5.p50,
                    centerY: am5.p50,
                    fill: am5.color(0x000000),
                    fontSize: 50
                }))

            serie.slices.template.set("tooltipText", "{category}: [bold]{value}[/] ({valuePercentTotal.formatNumber('0.00')}%)")
            serie.labels.template.set("text", "{category}: [bold]{value}[/]")

            serie.labels.template.adapters.add("y", (y, target) => {

                let dataItem = target.dataItem
                if (dataItem) {
                    let tick = dataItem.get("tick")
                    if (tick) {

                        // Menos del 1%, oculto
                        const valuePercent = dataItem.get("valuePercentTotal")

                        target.set("forceHidden", (valuePercent < 1))
                        tick.set("forceHidden", (valuePercent < 1))

                        // Si sale fuera del área de dibujo, oculto
                        if (y < -chart.height() / 2)
                            tick.set("forceHidden", true)
                        else
                            tick.set("forceHidden", false)
                    }
                    return y
                }
            })

            // Establece los datos de la serie (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data)
            serie.data.setAll(datosClientes)

            return serie
        }
    }

    //
    // Destruye el gráfico de clientes que más facturan.
    //
    function destruirGraficoFacturacionPorCliente() {
        const contenedorGrafico = document.querySelector("#grafico-clientes")

        rootGraficoFacturasPorCliente?.dispose()
        rootGraficoFacturasPorCliente = null

        contenedorGrafico.innerHTML = ""
        contenedorGrafico.classList.add("hidden")
    }

    // === Estadísticas de Proveedores que más facturan ===========================================

    //
    // Carga los datos estadísticos de gastos agrupados por proveedor de forma asíncrona.
    //
    async function cargarDatosGastosPorProveedor(fechaInicio, fechaFin) {

        try {
            const datosGastosPorProveedor = await datos.cargarDatosGastosPorProveedor(fechaInicio, fechaFin)
            return datosGastosPorProveedor
        }
        catch (error) {
            const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
            throw new Error(mensajeError)
        }
    }

    //
    // Imprime el gráfico de proveedores en los que más se gasta.
    //
    function printGraficoGastosPorProveedor(proveedores) {
        const contenedorGrafico = document.querySelector("#grafico-proveedores")

        // Crea el elemento raíz del gráfico (https://www.amcharts.com/docs/v5/getting-started/#Root_element)
        let root = am5.Root.new(contenedorGrafico)
        rootGraficoGastosPorProveedor = root

        // Establece el tema a usar (https://www.amcharts.com/docs/v5/concepts/themes/)
        root.setThemes([am5themes_Animated.new(root)])

        // Crea el formateador de moneda y la localización española
        root.numberFormatter.set("numberFormat", "#.###,00' €'")
        root.locale = am5locales_es_ES

        // Crea el gráfico (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/)
        var chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                layout: root.verticalLayout,
                innerRadius: am5.percent(50)
            }))

        // Añade la serie a representar (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series)
        const datosProveedores = crearDatos(proveedores)
        let serie = agregarDatosProveedores(datosProveedores)

        // Crea la leyenda del gráfico (https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/)
        var leyenda = chart.children.push(
            am5.Legend.new(root, {
                x: am5.percent(50),
                centerX: am5.percent(50),
                marginTop: 15,
                marginBottom: 15
            }))
        leyenda.data.setAll(serie.dataItems)

        // Inicia una animación al aparecer el gráfico (https://www.amcharts.com/docs/v5/concepts/animations/)
        contenedorGrafico.classList.remove("hidden")
        serie.appear(1000, 100)

        //
        // Crea los datos de gastos agrupados por proveedor para los proveedores más relevantes
        // y crea también un proveedor "Otros" con los menos relevantes, para que sirva para las
        // series del gráfico.
        // Devuelve un array de objetos `[ { nombre, total_gastado }, ... ]`.
        //
        function crearDatos(proveedores) {

            const MIN_GASTADO_PROVEEDOR = 500

            let datosProveedoresRelevantes = proveedores
                .filter(proveedor => parseFloat(proveedor.total_gastado) >= MIN_GASTADO_PROVEEDOR)

            let datosOtrosProveedores = proveedores
                .filter(proveedor => parseFloat(proveedor.total_gastado) < MIN_GASTADO_PROVEEDOR)
                .reduce((acumulado, proveedor) => {
                    return {
                        nombre: acumulado.nombre,
                        total_gastado: parseFloat(acumulado.total_gastado)
                                     + parseFloat(proveedor.total_gastado)
                    }},
                    { nombre: "Otros", total_gastado: 0 })

            datosProveedoresRelevantes.push(datosOtrosProveedores)

            datosProveedoresRelevantes = datosProveedoresRelevantes.map(proveedor => {
                return {
                    gastado: parseFloat(proveedor.total_gastado),
                    nombre: proveedor.nombre
                }
            })

            return datosProveedoresRelevantes
        }

        //
        // Crea la serie de datos de gastos para el gráfico.
        //
        function agregarDatosProveedores(datosProveedores) {

            var serie = chart.series.push(
                am5percent.PieSeries.new(root, {
                    valueField: "gastado",
                    categoryField: "nombre",
                    legendValueText: ""         // En la leyenda omite el valor (%)
                }))

            root.tooltipContainer.children.push(
                am5.Label.new(root, {
                    x: am5.p50,
                    y: am5.p50,
                    centerX: am5.p50,
                    centerY: am5.p50,
                    fill: am5.color(0x000000),
                    fontSize: 50
                }))

            serie.slices.template.set("tooltipText", "{category}: [bold]{value}[/] ({valuePercentTotal.formatNumber('0.00')}%)")
            serie.labels.template.set("text", "{category}: [bold]{value}[/]")

            serie.labels.template.adapters.add("y", (y, target) => {

                let dataItem = target.dataItem
                if (dataItem) {
                    let tick = dataItem.get("tick")
                    if (tick) {

                        // Menos del 1%, oculto
                        const valuePercent = dataItem.get("valuePercentTotal")

                        target.set("forceHidden", (valuePercent < 1))
                        tick.set("forceHidden", (valuePercent < 1))

                        // Si sale fuera del área de dibujo, oculto
                        if (y < -chart.height() / 2)
                            tick.set("forceHidden", true)
                        else
                            tick.set("forceHidden", false)
                    }
                    return y
                }
            })

            // Establece los datos de la serie (https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data)
            serie.data.setAll(datosProveedores)

            return serie
        }
    }

    //
    // Destruye el gráfico de proveedores en los que más se gasta.
    //
    function destruirGraficoGastosPorProveedor() {
        const contenedorGrafico = document.querySelector("#grafico-proveedores")

        rootGraficoGastosPorProveedor?.dispose()
        rootGraficoGastosPorProveedor = null

        contenedorGrafico.innerHTML = ""
        contenedorGrafico.classList.add("hidden")
    }
}

getEstadisticas()
