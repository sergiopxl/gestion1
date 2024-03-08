import * as api from "../../../assets/js/api_roots.js"

/**
 * Llama a la API para cargar los datos de facturación por fecha.
 *
 * @param {Date?} fechaInicio - Fecha inicial de la horquilla de datos a pedir.
 * @param {Date?} fechaFin - Fecha final de la horquilla de datos a pedir.
 *
 * @returns Objeto con los datos de facturación por fecha.
 */
export async function cargarFacturacionPorFecha(fechaInicio, fechaFin) {

    const url = urlConRangoDeFechas(`${api.UrlFacturasGet}?estadisticas`, fechaInicio, fechaFin)

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonFacturacion = await respuesta.json()

    return {
        totalFacturas: parseFloat(jsonFacturacion["total_facturas"]),
        fechaInicio: new Date(jsonFacturacion["fecha_inicio"]),
        fechaFin: new Date(jsonFacturacion["fecha_fin"]),
        facturasPorFecha: jsonFacturacion["facturas_por_fecha"]
    }
}

/**
 * Llama a la API para cargar los datos de gastos por fecha.
 *
 * @param {Date?} fechaInicio - Fecha inicial de la horquilla de datos a pedir.
 * @param {Date?} fechaFin - Fecha final de la horquilla de datos a pedir.
 *
 * @returns Objeto con los datos de gastos por fecha.
 */
export async function cargarGastosPorFecha(fechaInicio, fechaFin) {

    const url = urlConRangoDeFechas(`${api.UrlGastosGet}?estadisticas`, fechaInicio, fechaFin)

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonGastos = await respuesta.json()

    return {
        totalGastos: parseFloat(jsonGastos["total_gastos"]),
        fechaInicio: new Date(jsonGastos["fecha_inicio"]),
        fechaFin: new Date(jsonGastos["fecha_fin"]),
        gastosPorFecha: jsonGastos["gastos_por_fecha"]
    }
}

/**
 * Llama a la API para cargar los datos estadísticas de facturas agrupadas
 * por cliente.
 *
 * @returns Objeto con los datos de facturas por cliente.
 */
export async function cargarDatosFacturacionPorCliente(fechaInicio, fechaFin) {

    const url = urlConRangoDeFechas(`${api.UrlFacturasGet}?estadisticas=cliente`, fechaInicio, fechaFin)

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonFacturasPorCliente = await respuesta.json()
    return jsonFacturasPorCliente
}

/**
 * Llama a la API para cargar los datos estadísticas de gastos agrupados
 * por proveedor.
 *
 * @returns Objeto con los datos de facturas por cliente.
 */
export async function cargarDatosGastosPorProveedor(fechaInicio, fechaFin) {

    const url = urlConRangoDeFechas(`${api.UrlGastosGet}?estadisticas=proveedor`, fechaInicio, fechaFin)

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonGastosPorProveedor = await respuesta.json()
    return jsonGastosPorProveedor
}

//
// Compone la URL con los parámetros de URL necesarios para pedir un rango de fechas.
//
function urlConRangoDeFechas(url, fechaInicio, fechaFin) {

    const inicio = fechaInicio ? `inicio=${fechaInicio.toISOString().slice(0, 10)}` : ""
    const fin = fechaFin ? `&fin=${fechaFin.toISOString().slice(0, 10)}` : ""

    return url.includes("?")
        ? `${url}&${inicio}${fin}`
        : `${url}?${inicio}${fin}`
}