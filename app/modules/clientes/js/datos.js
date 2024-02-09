import * as api from "../../../assets/js/api_roots"

/**
 * Llama a la API para obtener el listado de Clientes.
 *
 * @param {number} pagina - El número de página a mostrar, empezando en la página 1.
 * @param {number} resultadosPorPagina - El número de clientes a mostrar por página.
 * @param {string?} busqueda - Texto a buscar para filtrar el listado de clientes devuelto
 *                             a aquellos cuyo nombre o CIF concuerde con dicho texto.
 *                             Si se especifica `null`, se devolverán todos los clientes.
 *
 * @returns Objeto con los datos de los clientes.
 */
export async function cargarClientes(pagina, resultadosPorPagina, busqueda) {

    const inicio = pagina > 1
        ? (pagina - 1) * resultadosPorPagina
        : 0
    const parametroInicio = `?inicio=${inicio}`
    let parametroPorPagina = `&porpagina=${resultadosPorPagina}`

    // Búsqueda
    let parametroBusqueda = ""
    if (busqueda && busqueda != "") {
        parametroBusqueda = `&buscar=${busqueda}`
        parametroPorPagina = "&porpagina=99999"
    }

    // Hace la llamada GET al API
    const url = api.UrlClientesGet + parametroInicio + parametroPorPagina + parametroBusqueda

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para crear un nuevo Cliente.
 *
 * @param {HTMLFormElement} formNuevoCliente - El formulario del que extraer los datos del nuevo cliente.
 * @returns Objeto con los datos del nuevo cliente.
 */
export async function guardarNuevoCliente(formNuevoCliente) {

    const datosFormulario = new FormData(formNuevoCliente)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlClientesPut, { method: "PUT", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando crear el cliente (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para actualizar los datos de un Cliente.
 *
 * @param {HTMLFormElement} formDatosCliente - El formulario del que extraer los datos del cliente.
 * @returns Objeto con los datos del cliente.
 */
export async function actualizarCliente(formDatosCliente) {

    const datosFormulario = new FormData(formDatosCliente)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlClientesUpdate, { method: "UPDATE", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando actualizar el cliente (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para crear un nuevo Contacto.
 *
 * @param {HTMLFormElement} formNuevoContacto - El formulario del que extraer los datos del nuevo contacto.
 * @returns Objeto con los datos del nuevo contacto.
 */
export async function guardarNuevoContacto(formNuevoContacto) {

    const datosFormulario = new FormData(formNuevoContacto)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlClientesContactoPut, { method: "PUT", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando crear el contacto (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para actualizar un Contacto.
 *
 * @param {HTMLFormElement} formContacto - El formulario del que extraer los datos del contacto.
 * @returns Objeto con los datos del contacto.
 */
export async function actualizarContacto(formContacto) {

    const datosFormulario = new FormData(formContacto)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlClientesContactoUpdate, { method: "UPDATE", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando actualizar el contacto (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para eliminar un Contacto.
 *
 * @param {number} idContacto - Id del contacto a eliminar.
 * @returns Objeto con los datos del contacto.
 */
export async function eliminarContacto(idContacto) {

    const respuesta = await fetch(`${api.UrlClientesContactoDelete}?contacto-id=${idContacto}`, { method: "DELETE" })

    if (!respuesta.ok)
        throw new Error(`Error intentando eliminar el contacto (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para obtener la lista de Sectores disponibles.
 *
 * @returns Objeto con los datos de los sectores.
 */
export async function cargarSectores() {

    const respuesta = await fetch(api.UrlClientesSectoresGet, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error intentando obtener los sectores disponibles (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}
