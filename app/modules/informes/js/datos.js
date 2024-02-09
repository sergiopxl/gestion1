import * as api from "../../../assets/js/api_roots"

/**
 * Llama a la API para cargar los datos de facturación por fecha.
 *
 * @returns Objeto con los datos de facturación por fecha.
 */
export async function cargarFacturacionPorFecha() {

    const respuesta = await fetch(`${api.UrlFacturasGet}?estadisticas`, { method: "GET" })

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
 * @returns Objeto con los datos de gastos por fecha.
 */
export async function cargarGastosPorFecha() {

    const respuesta = await fetch(`${api.UrlGastosGet}?estadisticas`, { method: "GET" })

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
export async function cargarDatosFacturacionPorCliente() {

    const respuesta = await fetch(`${api.UrlFacturasGet}?estadisticas=cliente`, { method: "GET" })

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
export async function cargarDatosGastosPorProveedor() {

    const respuesta = await fetch(`${api.UrlGastosGet}?estadisticas=proveedor`, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonGastosPorProveedor = await respuesta.json()
    return jsonGastosPorProveedor
}
