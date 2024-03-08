import * as api from "../../../assets/js/api_roots.js"

/**
 * Llama a la API para obtener el listado de Proveedores.
 *
 * @param {number} pagina - El número de página a mostrar, empezando en la página 1.
 * @param {number} resultadosPorPagina - El número de proveedores a mostrar por página.
 * @param {string?} busqueda - Texto a buscar para filtrar el listado de proveedores devuelto
 *                             a aquellos cuyo nombre o CIF concuerde con dicho texto.
 *                             Si se especifica `null`, se devolverán todos los proveedores.
 *
 * @returns Objeto con los datos de los proveedores.
 */
export async function cargarProveedores(pagina, resultadosPorPagina, busqueda) {

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
    const url = api.UrlProveedoresGet + parametroInicio + parametroPorPagina + parametroBusqueda

    const respuesta = await fetch(url, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para crear un nuevo Proveedor.
 *
 * @param {HTMLFormElement} formNuevoProveedor - El formulario del que extraer los datos del nuevo proveedor.
 * @returns Objeto con los datos del nuevo proveedor.
 */
export async function guardarNuevoProveedor(formNuevoProveedor) {

    const datosFormulario = new FormData(formNuevoProveedor)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlProveedoresPut, { method: "PUT", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando crear el proveedor (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para actualizar los datos de un Proveedor.
 *
 * @param {HTMLFormElement} formDatosProveedor - El formulario del que extraer los datos del proveedor.
 * @returns Objeto con los datos del proveedor.
 */
export async function actualizarProveedor(formDatosProveedor) {

    const datosFormulario = new FormData(formDatosProveedor)
    const jsonDatosForm = JSON.stringify(Object.fromEntries(datosFormulario.entries()))

    const respuesta = await fetch(api.UrlProveedoresUpdate, { method: "UPDATE", body: jsonDatosForm })

    if (!respuesta.ok)
        throw new Error(`Error intentando actualizar el proveedor (${respuesta.status})`)

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

    const respuesta = await fetch(api.UrlProveedoresContactoPut, { method: "PUT", body: jsonDatosForm })

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

    const respuesta = await fetch(api.UrlProveedoresContactoUpdate, { method: "UPDATE", body: jsonDatosForm })

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

    const respuesta = await fetch(`${api.UrlProveedoresContactoDelete}?contacto-id=${idContacto}`, { method: "DELETE" })

    if (!respuesta.ok)
        throw new Error(`Error intentando eliminar el contacto (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}

/**
 * Llama a la API para obtener la lista de Servicios disponibles.
 *
 * @returns Objeto con los datos de los servicios.
 */
export async function cargarServicios() {

    const respuesta = await fetch(api.UrlProveedoresServiciosGet, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error intentando obtener los servicios disponibles (${respuesta.status})`)

    const json = await respuesta.json()
    return json
}
