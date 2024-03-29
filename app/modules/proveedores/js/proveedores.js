import { navegacion } from "../../../assets/js/navegacion.js"
import { Pagination, PaginationOptions } from "../../../assets/js/paginacion.js"
import { Loader } from "../../../assets/js/loader.js"
import { formatoMoneda } from "../../../assets/js/formato_moneda.js"
import * as modals from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("proveedores.js v1.1")

navegacion("proveedores")

let paginaActual = 1
const opcionesPaginacion = new PaginationOptions()

const contenedorListado = document.querySelector("main")
const templateProveedor = document.querySelector(".proveedor-row")
const templateContacto = document.querySelector(".contactos-contacto")

// Prepara el botón de crear Proveedor nuevo
const botonNuevoProveedor = document.querySelector("#acciones > .nuevo-proveedor-boton")
botonNuevoProveedor.addEventListener("click", () => doNuevoProveedor())

// Prepara el buscador de proveedores
const buscador = document.querySelector("#buscador form")
const buscadorTexto = document.querySelector("#buscador-input")

buscador.addEventListener("submit", e => {
    e.preventDefault()
    const busqueda = buscadorTexto.value
    if (busqueda != "") {
        getProveedores(paginaActual = 1, busqueda)
    }
})

//
// Carga los Proveedores de forma paginada y, opcionalmente, filtrados con una cadena de búsqueda.
// Imprime los Proveedores en la interfaz, resaltando la búsqueda.
//
async function getProveedores(pagina, busqueda) {

    // Volvemos la vista a la parte superior cuando se cambia de página
    scroll({ top: 0, left: 0, behavior: "smooth" })

    // Paginación
    if (pagina)
        paginaActual = pagina

    // Búsqueda
    let busquedaActiva = (busqueda && busqueda != "")

    // Muestra un "Cargando proveedores..." si la carga tarda
    const loader = new Loader({ mensaje: "Cargando proveedores..." })

    try {
        const datosProveedores = await datos.cargarProveedores(paginaActual, opcionesPaginacion.registrosPorPagina, busqueda)
        printListaProveedores(datosProveedores.numero_proveedores, datosProveedores.proveedores, busquedaActiva, busqueda)
    }
    catch (error) {
        modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
        console.error(error)
    }
    finally {
        loader.destroy()
    }
}

//
// Imprime la lista de los Proveedores en la interfaz.
//
function printListaProveedores(numProveedores, proveedores, busquedaActiva, busqueda) {

    contenedorListado.innerHTML = ""

    // Preparamos la paginación
    if (!busquedaActiva) {
        buscadorTexto.value = ""
        document.querySelector("#paginacion").innerHTML = "<ul></ul>"

        opcionesPaginacion.paginaActual = paginaActual
        opcionesPaginacion.totalRegistros = numProveedores
        Pagination.crear(opcionesPaginacion, getProveedores)
    } else {
        const botonVerTodos = document.createElement("button")
        botonVerTodos.classList.add("btn-info")
        botonVerTodos.textContent = "Ver listado completo"
        botonVerTodos.addEventListener("click", () => getProveedores())

        document.querySelector("#paginacion").innerHTML = numProveedores == 1
            ? "<h2 class=\"paginacion-resultados\">1 proveedor encontrado</h2>"
            : `<h2 class=\"paginacion-resultados\">${numProveedores} proveedores encontrados</h2>`
        document.querySelector("#paginacion").append(botonVerTodos)
    }

    // Imprime los proveedores devueltos
    proveedores.forEach(proveedor => {
        const proveedorContenedor = templateProveedor.cloneNode(true)

        proveedorContenedor.classList.remove("hidden")

        // Botones de acciones
        const botonProveedorEditar = proveedorContenedor.querySelector(".proveedor-botones-editar")
        botonProveedorEditar.addEventListener("click", () => doEditar(proveedor))

        // Contenidos
        if (busquedaActiva)
            proveedorContenedor.querySelector(".proveedor-datos-nombre").innerHTML = resaltar(proveedor.nombre, busqueda)
        else
            proveedorContenedor.querySelector(".proveedor-datos-nombre").textContent = proveedor.nombre
        if (busquedaActiva)
            proveedorContenedor.querySelector(".proveedor-datos-cif").innerHTML = resaltar(proveedor.cif, busqueda)
        else
            proveedorContenedor.querySelector(".proveedor-datos-cif").textContent = proveedor.cif
        proveedorContenedor.querySelector(".proveedor-datos-tlf").textContent = proveedor.telefono;
        proveedorContenedor.querySelector(".proveedor-datos-direccion").textContent = proveedor.direccion;
        proveedorContenedor.querySelector(".proveedor-datos-servicio").textContent = `Servicio: ${proveedor.servicio}`;
        if (proveedor.gasto && proveedor.gasto > 0)
            proveedorContenedor.querySelector(".proveedor-datos-gasto").textContent = `Gasto total: ${formatoMoneda(proveedor.gasto)}`;

        printListaContactos(proveedorContenedor, proveedor.contactos)

        contenedorListado.append(proveedorContenedor)
    });
}

//
// Muestra el formulario de creación de nuevo Proveedor.
//
function doNuevoProveedor() {

    const bloqueFormulario = newBloqueFormulario()
    const formNuevoProveedor = bloqueFormulario.querySelector(".proveedor-formulario")

    // Para un nuevo Proveedor, ocultamos temporalmente la interfaz de modificación de los Contactos
    bloqueFormulario.querySelector(".proveedor-contactos-contenedor-formulario").innerHTML = ""

    const campoServicio = formNuevoProveedor.querySelector("[name = 'select-proveedor-servicio']")
    getServiciosProveedores(campoServicio)

    const botonEnviar = bloqueFormulario.querySelector(".formulario-boton-guardarNuevo")
    botonEnviar.classList.remove("hidden")
    botonEnviar.addEventListener("click", e => {
        e.preventDefault()
        modals.ConfirmBox.mostrar("¿Seguro que quiere guardar los datos?", guardarNuevoProveedor)
    })

    // Cambiamos la vista a la de creación
    const titulo = document.querySelector("#h1-apartado")
    titulo.textContent = "Nuevo proveedor"
    const barraAcciones = document.querySelector("#acciones")
    barraAcciones.classList.add("hidden")
    contenedorListado.innerHTML = ""
    contenedorListado.append(bloqueFormulario)

    //
    // Crea el nuevo Proveedor con los datos del formulario.
    //
    async function guardarNuevoProveedor() {

        try {
            const respuesta = await datos.guardarNuevoProveedor(formNuevoProveedor)

            modals.InfoBox.mostrar(respuesta)
        }
        catch (error) {
            modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            console.error(error)
        }
    }
}

//
// Edita el Proveedor seleccionado en la lista de Proveedores.
//
function doEditar(proveedor) {

    const bloqueFormulario = newBloqueFormulario()
    const formEditarProveedor = bloqueFormulario.querySelector(".proveedor-formulario")

    // Datos del proveedor
    const campoId = formEditarProveedor.querySelector("[name = 'input-proveedor-id']")
    campoId.value = proveedor.id
    const campoNombre = formEditarProveedor.querySelector("[name = 'input-proveedor-nombre']")
    campoNombre.value = proveedor.nombre
    const campoCIF = formEditarProveedor.querySelector("[name = 'input-proveedor-cif']")
    campoCIF.value = proveedor.cif
    const campoTelefono = formEditarProveedor.querySelector("[name = 'input-proveedor-tlf']")
    campoTelefono.value = proveedor.telefono
    const campoDireccion = formEditarProveedor.querySelector("[name = 'input-proveedor-direccion']")
    campoDireccion.value = proveedor.direccion
    const campoServicio = formEditarProveedor.querySelector("[name = 'select-proveedor-servicio']")
    getServiciosProveedores(campoServicio, proveedor)

    const botonEnviar = bloqueFormulario.querySelector(".formulario-boton-guardarCambios")
    botonEnviar.classList.remove("hidden")
    botonEnviar.addEventListener("click", e => {
        e.preventDefault()
        modals.ConfirmBox.mostrar("¿Seguro que quiere efectuar los cambios?", guardarUpdateProveedor)
    })

    // Mostramos los contactos
    setContactos()

    // Cambiamos la vista a la de edición
    const titulo = document.querySelector("#h1-apartado")
    titulo.textContent = "Editar proveedor"
    const barraAcciones = document.querySelector("#acciones")
    barraAcciones.classList.add("hidden")
    contenedorListado.innerHTML = ""
    contenedorListado.append(bloqueFormulario)

    //
    // Actualiza un Proveedor con los datos del formulario.
    //
    async function guardarUpdateProveedor() {

        try {
            const respuesta = await datos.actualizarProveedor(formEditarProveedor)

            modals.InfoBox.mostrar(respuesta)
        }
        catch (error) {
            modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            console.error(error)
        }
    }

    //
    // Compone la interfaz para mostrar, editar y eliminar los Contactos de un Proveedor.
    //
    function setContactos() {

        const contenedorContactos = bloqueFormulario.querySelector(".proveedor-contactos-contenedor-formulario")
        const contactoFormulario = contenedorContactos.querySelector(".proveedor-contactos-form")

        const botonNuevoContacto = contenedorContactos.querySelector(".nuevo-contacto-boton")
        botonNuevoContacto.addEventListener("click", doNuevoContacto)

        proveedor.contactos.forEach(contacto => {
            const nuevoFormularioContacto = contactoFormulario.cloneNode(true)

            nuevoFormularioContacto.querySelector("[name = 'input-contacto-id']").value = contacto.id
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-nombre']").value = contacto.name
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-apellido1']").value = contacto.apell1
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-apellido2']").value = contacto.apell2
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-telefono']").value = contacto.phone1
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-email']").value = contacto.mail1

            const botonEnviar = nuevoFormularioContacto.querySelector("button.enviar")
            botonEnviar.addEventListener("click", e => {
                e.preventDefault()
                modals.ConfirmBox.mostrar("¿Seguro que quiere efectuar los cambios?", () => guardarUpdateContacto(nuevoFormularioContacto))
            })
            const botonEliminar = nuevoFormularioContacto.querySelector("button.eliminar")
            botonEliminar.addEventListener("click", e => {
                e.preventDefault()
                modals.ConfirmBox.mostrar("¿Seguro que quiere eliminar el contacto?", () => eliminarContacto(nuevoFormularioContacto, contacto.id))
            })

            nuevoFormularioContacto.classList.remove("hidden")
            contenedorContactos.append(nuevoFormularioContacto)
        })

        //
        // Crea un formulario para crear un nuevo Contacto y lo añade a la interfaz.
        //
        function doNuevoContacto() {

            const nuevoFormularioContacto = contactoFormulario.cloneNode(true)

            nuevoFormularioContacto.querySelector("[name = 'input-contacto-idProveedor']").value = proveedor.id

            const botonEnviar = nuevoFormularioContacto.querySelector("button.enviar")
            botonEnviar.textContent = "Crear contacto"
            const funCrearContacto = e => {
                e.preventDefault()
                modals.ConfirmBox.mostrar("¿Seguro que quiere crear el contacto con estos datos?", guardarNuevoContacto)
            }
            botonEnviar.addEventListener("click", funCrearContacto)
            const botonEliminar = nuevoFormularioContacto.querySelector("button.eliminar")
            botonEliminar.classList.add("hidden")

            nuevoFormularioContacto.classList.remove("hidden")
            contactoFormulario.after(nuevoFormularioContacto)

            //
            // Crea un Contacto nuevo con los datos del formulario.
            //
            async function guardarNuevoContacto() {

                let respuesta;

                try {
                    respuesta = await datos.guardarNuevoContacto(nuevoFormularioContacto)
                    modals.InfoBox.mostrar(respuesta.mensaje)
                }
                catch (error) {
                    modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
                    console.error(error)
                    return
                }

                // Establecemos el Id que la BD ha asignado al nuevo Contacto
                const idNuevoContacto = respuesta.id
                nuevoFormularioContacto.querySelector("[name = 'input-contacto-id']").value = idNuevoContacto

                // Activamos el botón para eliminar el Contacto
                botonEliminar.classList.remove("hidden")
                botonEliminar.addEventListener("click", e => {
                    e.preventDefault()
                    modals.ConfirmBox.mostrar("¿Seguro que quiere eliminar el contacto?", () => eliminarContacto(nuevoFormularioContacto, idNuevoContacto))
                })

                // Cambiamos el botón de crear Contacto por el de modificar
                botonEnviar.textContent = "Guardar cambios"
                botonEnviar.removeEventListener("click", funCrearContacto)
                botonEnviar.addEventListener("click", e => {
                    e.preventDefault()
                    modals.ConfirmBox.mostrar("¿Seguro que quiere modificar el contacto con estos datos?", () => guardarUpdateContacto(nuevoFormularioContacto))
                })
            }
        }

        //
        // Actualiza un Contacto con los datos del formulario.
        //
        async function guardarUpdateContacto(formContacto) {

            try {
                const respuesta = await datos.actualizarContacto(formContacto)
                modals.InfoBox.mostrar(respuesta)
            }
            catch (error) {
                modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
                console.error(error)
            }
        }

        //
        // Elimina el Contacto indicado en el formulario.
        //
        async function eliminarContacto(formContacto, contactoId) {

            try {
                const respuesta = await datos.eliminarContacto(contactoId)

                formContacto.parentElement.removeChild(formContacto)
                modals.InfoBox.mostrar(respuesta)
            }
            catch (error) {
                modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            }
        }
    }
}

//
// Llama a la API para obtener los Servicios disponibles para el Proveedor.
//
async function getServiciosProveedores(selectServicio, proveedor) {

    let servicios = []

    try {
        servicios = await datos.cargarServicios()
    }
    catch (error) {
        modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
        console.error(error)
    }

    servicios.forEach(servicio => {

        const opcionServicio = document.createElement("option")
        opcionServicio.value = servicio.id
        opcionServicio.textContent = servicio.name

        if (proveedor && servicio.id == proveedor.id_servicio)
            opcionServicio.setAttribute("selected", "selected")

        selectServicio.append(opcionServicio)
    })
}

//
// Crea un contenedor HTML #bloque-formulario clonado, asegurándose de que cambia el id por una class
// y lo hace visible.
//
function newBloqueFormulario() {

    const bloqueFormulario = document.querySelector("#bloque-formulario").cloneNode(true)
    bloqueFormulario.id = ""
    bloqueFormulario.classList.add("bloque-formulario")
    bloqueFormulario.classList.remove("hidden")

    return bloqueFormulario
}

//
// Imprime la lista de los Contactos de un Proveedor en la interfaz.
//
function printListaContactos(proveedor, contactos) {

    const contenedorContactos = proveedor.querySelector(".proveedor-row-contactos")

    contenedorContactos.innerHTML = ""

    contactos.forEach(contacto => {
        const contactoContenedor = templateContacto.cloneNode(true)

        contactoContenedor.querySelector(".contacto-nombre").textContent = `${contacto.name} ${contacto.apell1} ${contacto.apell2}`
        contactoContenedor.querySelector(".contacto-tlf").textContent = contacto.phone1
        contactoContenedor.querySelector(".contacto-email").textContent = contacto.mail1

        contenedorContactos.append(contactoContenedor)
    });
}

//
// Devuelve un HTML donde aparecen resaltados los términos de búsqueda.
//
function resaltar(texto, busqueda) {

    let buscar = busqueda.toLowerCase()
    let cadenaResaltada = ""

    let posBusqueda = 0
    while ((posBusqueda = texto.toLowerCase().indexOf(buscar)) >= 0) {

        cadenaResaltada += texto.substring(0, posBusqueda)

        const resaltado = texto.substring(posBusqueda, posBusqueda + buscar.length)
        cadenaResaltada += `<span class="resaltar">${resaltado}</span>`

        texto = texto.substring(posBusqueda + buscar.length)
    }

    return cadenaResaltada + texto
}

getProveedores()
