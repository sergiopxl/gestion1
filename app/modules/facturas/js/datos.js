import * as api from "../../../assets/js/api_roots.js"

/**
 * Llama a la API para obtener la Factura con el Id especificado.
 *
 * @param {number} id - Identificador de la Factura a buscar.
 * @returns Objeto con los datos de la Factura.
 */
export async function cargarFacturaPorId(id) {

    // Hace la llamada GET al API para buscar
    const url = `${api.UrlFacturasGet}?id=${id}`

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonFacturas = await respuesta.json()
    return jsonFacturas.facturas[0]
}

/**
 * Llama a la API para obtener el listado de Facturas.
 *
 * @param {number} pagina - El número de página a mostrar, empezando en la página 1.
 * @param {number} resultadosPorPagina - El número de facturas a mostrar por página.
 * @returns Objeto con los datos de las facturas.
 */
export async function cargarFacturas(pagina, resultadosPorPagina) {

    const inicio = pagina > 1
        ? (pagina - 1) * resultadosPorPagina
        : 0
    const parametroInicio = `?inicio=${inicio}`
    let parametroPorPagina = `&porpagina=${resultadosPorPagina}`

    // Hace la llamada GET al API
    const url = api.UrlFacturasGet + parametroInicio + parametroPorPagina

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para buscar aquellos Clientes que concuerden con una búsqueda.
 *
 * @param {string} busqueda - Texto a buscar en el nombre de los Clientes o en el CIF.
 * @returns Objeto con los datos de las Clientes.
 */
export async function buscarClientes(busqueda) {

    // Hace la llamada GET al API para buscar
    // NOTA: Para esta búsqueda simple, usamos el modo "simple", ya que no nos interesa
    //       ningún dato en particular todavía.
    const url = `${api.UrlClientesGet}?buscar=${busqueda}&simple`

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para obtener el Cliente con el Id especificado.
 *
 * @param {number} id - Identificador del Cliente a buscar.
 * @returns Objeto con los datos del Cliente.
 */
export async function cargarClientePorId(id) {

    // Hace la llamada GET al API para buscar
    const url = `${api.UrlClientesGet}?id=${id}`

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const jsonClientes = await respuesta.json()
    return jsonClientes.clientes[0]
}

/**
 * Llama a la API para crear una nueva Factura.
 *
 * @param {object} datosNuevaFactura - Objeto con los datos de la nueva Factura.
 * @returns Objeto con los datos de la nueva Factura.
 */
export async function guardarNuevaFactura(datosNuevaFactura) {

    const jsonDatosFactura = JSON.stringify(datosNuevaFactura)

    const respuesta = await fetch(api.UrlFacturasPut, { method: "PUT", body: jsonDatosFactura })

    if (!respuesta.ok)
        throw new Error(`Error intentando crear la factura (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para actualizar los datos de una Factura y sus Conceptos.
 *
 * @param {object} datosFactura - Objeto con los datos de la Factura a actualizar.
 * @returns Objeto con los datos de la Factura.
 */
export async function actualizarFactura(datosFactura) {

    const jsonDatosFactura = JSON.stringify(datosFactura)

    const respuesta = await fetch(api.UrlFacturasUpdate, { method: "UPDATE", body: jsonDatosFactura })

    if (!respuesta.ok)
        throw new Error(`Error intentando actualizar la factura (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}
