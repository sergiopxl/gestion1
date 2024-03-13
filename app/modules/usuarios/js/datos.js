import * as api from "../../../assets/js/api_roots.js"

/**
 * Llama a la API para obtener el listado de Usuarios.
 *
 * @returns Objeto con los datos de los usuarios.
 */
export async function cargarUsuarios() {

    // Hace la llamada GET al API
    const respuesta = await fetch(api.UrlUsuariosGet, { method: "GET" })

    if (!respuesta.ok)
        throw new Error(`Error en la solicitud: ${respuesta.status}`)

    const json = await respuesta.json()
    return json
}
