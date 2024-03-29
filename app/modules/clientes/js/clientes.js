import { navegacion } from "../../../assets/js/navegacion.js"
import { Pagination, PaginationOptions } from "../../../assets/js/paginacion.js"
import { Loader } from "../../../assets/js/loader.js"
import { formatoMoneda } from "../../../assets/js/formato_moneda.js"
import * as modals from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("clientes.js v1.1")

navegacion("clientes")

let paginaActual = 1
const opcionesPaginacion = new PaginationOptions()

const contenedorListado = document.querySelector("main")
const templateCliente = document.querySelector(".cliente-row")
const templateContacto = document.querySelector(".contactos-contacto")

// Prepara el botón de crear Cliente nuevo
const botonNuevoCliente = document.querySelector("#acciones > .nuevo-cliente-boton")
botonNuevoCliente.addEventListener("click", () => doNuevoCliente())

// Prepara el buscador de clientes
const buscador = document.querySelector("#buscador form")
const buscadorTexto = document.querySelector("#buscador-input")

buscador.addEventListener("submit", e => {
    e.preventDefault()
    const busqueda = buscadorTexto.value
    if (busqueda != "") {
        getClientes(paginaActual = 1, busqueda)
    }
})

//
// Carga los Clientes de forma paginada y, opcionalmente, filtrados con una cadena de búsqueda.
// Imprime los Clientes en la interfaz, resaltando la búsqueda.
//
async function getClientes(pagina, busqueda) {

    // Volvemos la vista a la parte superior cuando se cambia de página
    scroll({ top: 0, left: 0, behavior: "smooth" })

    // Paginación
    if (pagina)
        paginaActual = pagina

    // Búsqueda
    let busquedaActiva = (busqueda && busqueda != "")

    // Muestra un "Cargando clientes..." si la carga tarda
    const loader = new Loader({ mensaje: "Cargando clientes..." })

    try {
        const datosClientes = await datos.cargarClientes(paginaActual, opcionesPaginacion.registrosPorPagina, busqueda)
        printListaClientes(datosClientes.numero_clientes, datosClientes.clientes, busquedaActiva, busqueda)
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
// Imprime la lista de los Clientes en la interfaz.
//
function printListaClientes(numClientes, clientes, busquedaActiva, busqueda) {

    contenedorListado.innerHTML = ""

    // Preparamos la paginación
    if (!busquedaActiva) {
        buscadorTexto.value = ""
        document.querySelector("#paginacion").innerHTML = "<ul></ul>"

        opcionesPaginacion.paginaActual = paginaActual
        opcionesPaginacion.totalRegistros = numClientes
        Pagination.crear(opcionesPaginacion, getClientes)
    } else {
        const botonVerTodos = document.createElement("button")
        botonVerTodos.classList.add("btn-info")
        botonVerTodos.textContent = "Ver listado completo"
        botonVerTodos.addEventListener("click", () => getClientes())

        document.querySelector("#paginacion").innerHTML = numClientes == 1
            ? "<h2 class=\"paginacion-resultados\">1 cliente encontrado</h2>"
            : `<h2 class=\"paginacion-resultados\">${numClientes} clientes encontrados</h2>`
        document.querySelector("#paginacion").append(botonVerTodos)
    }

    // Imprime los clientes devueltos
    clientes.forEach(cliente => {
        const clienteContenedor = templateCliente.cloneNode(true)

        clienteContenedor.classList.remove("hidden")

        // Botones de acciones
        const botonClienteEditar = clienteContenedor.querySelector(".cliente-botones-editar")
        const botonClienteFactura = clienteContenedor.querySelector(".cliente-botones-factura")
        botonClienteEditar.addEventListener("click", () => doEditar(cliente))
        botonClienteFactura.addEventListener("click", () => doFactura(cliente.id))

        // Contenidos
        if (busquedaActiva)
            clienteContenedor.querySelector(".cliente-datos-nombre").innerHTML = resaltar(cliente.nombre, busqueda)
        else
            clienteContenedor.querySelector(".cliente-datos-nombre").textContent = cliente.nombre
        if (busquedaActiva)
            clienteContenedor.querySelector(".cliente-datos-cif").innerHTML = resaltar(cliente.cif, busqueda)
        else
            clienteContenedor.querySelector(".cliente-datos-cif").textContent = cliente.cif
        clienteContenedor.querySelector(".cliente-datos-tlf").textContent = cliente.telefono;
        clienteContenedor.querySelector(".cliente-datos-direccion").textContent = cliente.direccion;
        clienteContenedor.querySelector(".cliente-datos-sector").textContent = `Sector: ${cliente.sector}`;
        if (cliente.facturacion && cliente.facturacion > 0)
            clienteContenedor.querySelector(".cliente-datos-facturacion").textContent = `Facturación total: ${formatoMoneda(cliente.facturacion)}`;

        printListaContactos(clienteContenedor, cliente.contactos)

        contenedorListado.append(clienteContenedor)
    });
}

//
// Muestra el formulario de creación de nuevo Cliente.
//
function doNuevoCliente() {

    const bloqueFormulario = newBloqueFormulario()
    const formNuevoCliente = bloqueFormulario.querySelector(".cliente-formulario")

    // Para un nuevo Cliente, ocultamos temporalmente la interfaz de modificación de los Contactos
    bloqueFormulario.querySelector(".cliente-contactos-contenedor-formulario").innerHTML = ""

    const campoSector = formNuevoCliente.querySelector("[name = 'select-cliente-sector']")
    getSectoresClientes(campoSector)

    const botonEnviar = bloqueFormulario.querySelector(".formulario-boton-guardarNuevo")
    botonEnviar.classList.remove("hidden")
    botonEnviar.addEventListener("click", e => {
        e.preventDefault()
        modals.ConfirmBox.mostrar("¿Seguro que quiere guardar los datos?", guardarNuevoCliente)
    })

    // Cambiamos la vista a la de creación
    const titulo = document.querySelector("#h1-apartado")
    titulo.textContent = "Nuevo cliente"
    const barraAcciones = document.querySelector("#acciones")
    barraAcciones.classList.add("hidden")
    contenedorListado.innerHTML = ""
    contenedorListado.append(bloqueFormulario)

    //
    // Crea el nuevo Cliente con los datos del formulario.
    //
    async function guardarNuevoCliente() {

        try {
            const respuesta = await datos.guardarNuevoCliente(formNuevoCliente)

            modals.InfoBox.mostrar(respuesta)
        }
        catch (error) {
            modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            console.error(error)
        }
    }
}

//
// Edita el Cliente seleccionado en la lista de Clientes.
//
function doEditar(cliente) {

    const bloqueFormulario = newBloqueFormulario()
    const formEditarCliente = bloqueFormulario.querySelector(".cliente-formulario")

    // Datos del cliente
    const campoId = formEditarCliente.querySelector("[name = 'input-cliente-id']")
    campoId.value = cliente.id
    const campoNombre = formEditarCliente.querySelector("[name = 'input-cliente-nombre']")
    campoNombre.value = cliente.nombre
    const campoCIF = formEditarCliente.querySelector("[name = 'input-cliente-cif']")
    campoCIF.value = cliente.cif
    const campoTelefono = formEditarCliente.querySelector("[name = 'input-cliente-tlf']")
    campoTelefono.value = cliente.telefono
    const campoDireccion = formEditarCliente.querySelector("[name = 'input-cliente-direccion']")
    campoDireccion.value = cliente.direccion
    const campoSector = formEditarCliente.querySelector("[name = 'select-cliente-sector']")
    getSectoresClientes(campoSector, cliente)

    const botonEnviar = bloqueFormulario.querySelector(".formulario-boton-guardarCambios")
    botonEnviar.classList.remove("hidden")
    botonEnviar.addEventListener("click", e => {
        e.preventDefault()
        modals.ConfirmBox.mostrar("¿Seguro que quiere efectuar los cambios?", guardarUpdateCliente)
    })

    // Mostramos los contactos
    setContactos()

    // Cambiamos la vista a la de edición
    const titulo = document.querySelector("#h1-apartado")
    titulo.textContent = "Editar cliente"
    const barraAcciones = document.querySelector("#acciones")
    barraAcciones.classList.add("hidden")
    contenedorListado.innerHTML = ""
    contenedorListado.append(bloqueFormulario)

    //
    // Actualiza un Cliente con los datos del formulario.
    //
    async function guardarUpdateCliente() {

        try {
            const respuesta = await datos.actualizarCliente(formEditarCliente)

            modals.InfoBox.mostrar(respuesta)
        }
        catch (error) {
            modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            console.error(error)
        }
    }

    //
    // Compone la interfaz para mostrar, editar y eliminar los Contactos de un Cliente.
    //
    function setContactos() {

        const contenedorContactos = bloqueFormulario.querySelector(".cliente-contactos-contenedor-formulario")
        const contactoFormulario = contenedorContactos.querySelector(".cliente-contactos-form")

        const botonNuevoContacto = contenedorContactos.querySelector(".nuevo-contacto-boton")
        botonNuevoContacto.addEventListener("click", doNuevoContacto)

        cliente.contactos.forEach(contacto => {
            const nuevoFormularioContacto = contactoFormulario.cloneNode(true)

            nuevoFormularioContacto.querySelector("[name = 'input-contacto-id']").value = contacto.id
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-nombre']").value = contacto.nombre
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-apellido1']").value = contacto.apellido1
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-apellido2']").value = contacto.apellido2
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-telefono']").value = contacto.telefono1
            nuevoFormularioContacto.querySelector("[name = 'input-contacto-email']").value = contacto.email1

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

            nuevoFormularioContacto.querySelector("[name = 'input-contacto-idCliente']").value = cliente.id

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
                console.error(error)
            }
        }
    }
}

//
// Llama a la API para obtener los Sectores disponibles para el Cliente.
//
async function getSectoresClientes(selectSector, cliente) {

    let sectores = []

    try {
        sectores = await datos.cargarSectores()
    }
    catch (error) {
        modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
        console.error(error)
    }

    sectores.forEach(sector => {

        const opcionSector = document.createElement("option")
        opcionSector.value = sector.id
        opcionSector.textContent = sector.nombre

        if (cliente && sector.id == cliente.id_sector)
            opcionSector.setAttribute("selected", "selected")

        selectSector.append(opcionSector)
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
// Imprime la lista de los Contactos de un Cliente en la interfaz.
//
function printListaContactos(cliente, contactos) {

    const contenedorContactos = cliente.querySelector(".cliente-row-contactos")

    contenedorContactos.innerHTML = ""

    contactos.forEach(contacto => {
        const contactoContenedor = templateContacto.cloneNode(true)

        contactoContenedor.querySelector(".contacto-nombre").textContent = `${contacto.nombre} ${contacto.apellido1} ${contacto.apellido2}`
        contactoContenedor.querySelector(".contacto-tlf").textContent = contacto.telefono1
        contactoContenedor.querySelector(".contacto-email").textContent = contacto.email1

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

getClientes()
