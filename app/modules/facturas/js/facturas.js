import { navegacion } from "../../../assets/js/navegacion.js"
import { PaginationOptions, Pagination } from "../../../assets/js/paginacion.js"
import { Loader } from "../../../assets/js/loader.js"
import { formatoMoneda } from "../../../assets/js/formato_moneda.js"
import { fechaCorta } from "../../../assets/js/formato_fecha.js"
import * as modals from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("facturas.js 1.1")

navegacion("facturas")

let paginaActual = 1
const opcionesPaginacion = new PaginationOptions()

const contenedorMain = document.querySelector("main")
const plantillaFacturaRow = document.querySelector("#factura-template")
const plantillaFacturaItem = document.querySelector("#factura-item-template")
const plantillaBuscadorClientes = document.querySelector("#buscador-clientes")

const botonNuevaFactura = document.querySelector("#nueva-factura-btn")
botonNuevaFactura.addEventListener("click", () => nuevaFactura())

//
// Carga las Facturas.
// Imprime las Facturas en la interfaz.
//
async function getFacturas(pagina) {

    // Volvemos la vista a la parte superior cuando se cambia de página
    scroll({ top: 0, left: 0, behavior: "smooth" })

    // Paginación
    if (pagina)
        paginaActual = pagina

    // Muestra un mensaje si la carga tarda
    const loader = new Loader({ mensaje: "Cargando facturas..." })

    try {
        const datosFacturas = await datos.cargarFacturas(paginaActual, opcionesPaginacion.registrosPorPagina)
        printFacturas(datosFacturas.numero_facturas, datosFacturas.facturas)
    }
    catch (error) {
        modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
    }
    finally {
        loader.destroy()
    }
}

//
// Imprime la lista de las Facturas en la interfaz.
//
function printFacturas(numFacturas, facturas) {

    contenedorMain.innerHTML = ""

    // Preparamos la paginación
    document.querySelector("#paginacion").innerHTML = "<ul></ul>"
    opcionesPaginacion.paginaActual = paginaActual
    opcionesPaginacion.totalRegistros = numFacturas
    Pagination.crear(opcionesPaginacion, getFacturas)

    // Imprime una fila por cada factura
    for (let factura of facturas) {

        const facturaRow = plantillaFacturaRow.cloneNode(true)
        facturaRow.setAttribute("id", "")
        facturaRow.classList.remove("hidden")

        const baseImponible = parseFloat(factura.baseimponible)
        const iva = parseFloat(factura.iva) / 100
        const importe = baseImponible * (1 + iva)

        // Poblamos los datos de la factura y el cliente
        facturaRow.dataset.idFactura = factura.id
        facturaRow.querySelector(".factura-numero").innerHTML = `Nº <strong>${factura.id}</strong>`
        facturaRow.querySelector(".factura-cliente").innerHTML = `Cliente: <strong>${factura.cliente}</strong>`
        facturaRow.querySelector(".factura-estado").innerHTML = `Estado: <strong>${factura.estado}</strong>`
        facturaRow.querySelector(".factura-importe").innerHTML = `Importe: <strong>${formatoMoneda(importe)}</strong>`
        facturaRow.querySelector(".factura-descripcion").innerHTML = `Descripción: <strong>${factura.descripcion}</strong>`

        const fechaEmision = new Date(factura.fecha_emision)
        facturaRow.querySelector(".factura-fecha-emision").innerHTML = `Emisión: <strong>${fechaCorta(fechaEmision)}</strong>`

        const facturaEnviada = (factura.fecha_envio !== "0000-00-00")
        if (facturaEnviada) {
            const fechaEnvio = new Date(factura.fecha_envio)
            facturaRow.querySelector(".factura-fecha-envio").innerHTML = `Envío: <strong>${fechaCorta(fechaEnvio)}</strong>`
        }

        // Controlamos los botones de acción sobre la factura
        const botonEditar = facturaRow.querySelector(".factura-editar-button")
        botonEditar.addEventListener("click", doEditarFactura)

        const contenedorItems = facturaRow.querySelector(".factura-items")
        contenedorItems.innerHTML = ""

        // Imprime los "items" de la factura
        for (let item of factura.items) {

            const facturaItem = plantillaFacturaItem.cloneNode(true)
            facturaItem.setAttribute("id", "")
            facturaItem.classList.remove("hidden")

            const importeItem = parseFloat(item.importe) * (1 + iva)

            // Poblamos los datos del "item"
            facturaItem.querySelector("[name = 'input-item-id']").textContent = item.id
            facturaItem.querySelector(".item-descripcion").textContent = item.descripcion
            facturaItem.querySelector(".item-importe").textContent = formatoMoneda(importeItem)

            contenedorItems.append(facturaItem)
        }

        contenedorMain.append(facturaRow)
    }

    //
    // Función de respuesta a la pulsación del botón de "Editar" la factura.
    //
    function doEditarFactura(evento) {

        const rowFactura = evento.target.closest(".factura-row")
        const facturaId = rowFactura?.dataset?.idFactura ?? 0

        editarFactura(facturaId)
    }
}

//
// Muestra la interfaz para crear una nueva Factura.
//
function nuevaFactura() {

    contenedorMain.innerHTML = ""

    document.querySelector("#h1-apartado").textContent = "Nueva factura"

    // Clona y muestra la interfaz con los campos de la Factura
    const plantillaNuevaFactura = document.querySelector("#factura-new-template")

    const divNuevaFactura = plantillaNuevaFactura.cloneNode(true)
    divNuevaFactura.setAttribute("id", "")
    divNuevaFactura.classList.remove("hidden")

    // Para la nueva Factura, usamos la fecha actual
    const fechaHoy = new Date()
    const campoFechaFactura = divNuevaFactura.querySelector("#input-fecha-emision")
    campoFechaFactura.value = fechaHoy.toISOString().slice(0, 10)  // toISOString() -> 2024-02-07T16:48:23.375Z

    // Controlamos el IVA para calcular el importe total
    divNuevaFactura.querySelector("#input-iva").addEventListener("input", e => {
        const iva = parseFloat(e.target.value)
        if (!isNaN(iva))
            calcularImporteTotal()
    })

    // Controlamos el botón de búsqueda de Cliente
    let clienteSeleccionado = null
    const inputIdCliente = divNuevaFactura.querySelector("input[name = 'input-id-cliente']")
    const vistaCliente = divNuevaFactura.querySelector(".cliente-vista")
    divNuevaFactura.querySelector("#buscar-cliente-btn").addEventListener("click", buscarCliente)

    let baseImponible = 0

    const selectContactos = divNuevaFactura.querySelector("select[name = 'contacto-select']")

    contenedorMain.append(divNuevaFactura)

    const plantillaNuevoConcepto = document.querySelector("#concepto-template")

    // Cambia la barra de acciones
    cambiarBarraDeAcciones()

    const contenedorConceptos = divNuevaFactura.querySelector(".listado-conceptos")
    contenedorConceptos.innerHTML = ""

    //
    // Quita la barra de acciones general y muestra las acciones de edición.
    //
    function cambiarBarraDeAcciones() {

        const barraAcciones = document.querySelector("#acciones")
        // barraAcciones.innerHTML = ""

        barraAcciones.querySelector("#nueva-factura-btn").remove()
        barraAcciones.querySelector("#paginacion").remove()
        barraAcciones.querySelector("#buscador").remove()

        const accionesCreacion = barraAcciones.querySelector("#acciones-edicion")
        accionesCreacion.classList.remove("hidden")

        const botonNuevoConcepto = accionesCreacion.querySelector(".boton-nuevo-concepto")
        botonNuevoConcepto.addEventListener("click", crearConcepto)

        const botonGuardarFactura = accionesCreacion.querySelector(".boton-guardar-factura")
        botonGuardarFactura.addEventListener("click", guardarNuevaFactura)
    }

    //
    // Llama a la API para guardar la nueva Factura.
    //
    async function guardarNuevaFactura() {

        // Recalculamos la base imponible y, con el IVA, el importe total
        calcularImporteTotal()

        const datosFactura = componerObjetoFactura()

        // Validamos
        if (validarFactura(datosFactura)) {

            try {
                const respuesta = await datos.guardarNuevaFactura(datosFactura)
                console.log(respuesta)
                modals.InfoBox.mostrar("Factura creada correctamente.")
            }
            catch (error) {
                modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            }
        }

        //
        // Convierte los datos de la Factura y sus Conceptos en un objeto que se puede validar o enviar.
        //
        function componerObjetoFactura() {

            const datos = {}

            // IVA
            const campoIVA = document.querySelector("#input-iva")
            const iva = parseFloat(campoIVA.value)

            if (campoIVA.value !== "" && !isNaN(iva))
                datos.iva = iva

            // Base imponible
            if (baseImponible != 0)
                datos.baseImponible = baseImponible

            // Cliente
            const idCliente = clienteSeleccionado?.id ?? 0

            if (idCliente != 0)
                datos.idCliente = idCliente

            // Contacto del Cliente
            const idContacto = selectContactos.value

            if (idContacto != 0)
                datos.idContacto = idContacto

            // Fecha de emisión
            if (campoFechaFactura.valueAsDate != null)
                datos.fechaEmision = campoFechaFactura.value

            // Conceptos
            datos.conceptos = []
            const conceptos = contenedorConceptos.querySelectorAll(".factura-concepto")
            for (let divConcepto of conceptos) {

                const datosConcepto = {}

                // Descripción
                const descripcion = divConcepto.querySelector("[name = 'descripcion-concepto']")
                datosConcepto.descripcion = descripcion.value

                // Importe
                const campoImporte = divConcepto.querySelector("[name = 'input-importe']")
                const importe = parseFloat(campoImporte.value)

                if (campoImporte.value !== "" && !isNaN(importe))
                    datosConcepto.importe = importe

                datos.conceptos.push(datosConcepto)
            }

            return datos
        }

        //
        // Valida que los datos de la nueva Factura sean correctos.
        //
        function validarFactura(datosFactura) {

            let errores = ""

            if (datosFactura.iva === undefined)
                errores = "No se ha indicado un porcentaje de IVA correcto.<br>"

            if (datosFactura.idCliente === undefined)
                errores += "No se ha elegido ningún Cliente.<br>"
            if (datosFactura.idContacto === undefined)
                errores += "No se ha elegido ningún Contacto.<br>"

            if (datosFactura.fechaEmision === undefined)
                errores += "No se ha indicado la fecha de emisión.<br>"

            if (datosFactura.conceptos.length === 0)
                errores += `La factura no tiene ningún concepto.<br>`
            else
                datosFactura.conceptos.forEach((datosConcepto, i) => {

                    if (datosConcepto.importe === undefined)
                        errores += `No se ha indicado importe para el concepto ${i + 1}.<br>`

                    if (datosConcepto.descripcion === undefined)
                        errores += `No se ha indicado descripción para el concepto ${i + 1}.<br>`
                })

            // Si tenemos algún error, la factura NO es válida
            if (errores != "") {
                modals.ErrorBox.mostrar("<p><strong>No se puede guardar la Factura porque contiene datos no válidos</strong></p>" + errores)
                return false
            }

            return true
        }
    }

    //
    // Crea un nuevo Concepto para la Factura actual.
    //
    function crearConcepto() {

        const divNuevoConcepto = plantillaNuevoConcepto.cloneNode(true)
        divNuevoConcepto.classList.remove("hidden")
        divNuevoConcepto.setAttribute("id", "")

        divNuevoConcepto.querySelector("[name = 'input-importe']").addEventListener("input", e => {
            const importe = parseFloat(e.target.value)
            if (!isNaN(importe))
                calcularImporteTotal()
        })

        divNuevoConcepto.querySelector(".eliminar-concepto").addEventListener("click", () => {
            divNuevoConcepto.parentNode.removeChild(divNuevoConcepto)
            calcularImporteTotal()
        })

        contenedorConceptos.append(divNuevoConcepto)
    }

    //
    // Muestra un diálogo modal para que el usuario elija un Cliente al que asignar la Factura.
    //
    function buscarCliente() {

        // Clonamos la interfaz del buscador
        const interfazBuscador = plantillaBuscadorClientes.cloneNode(true)
        interfazBuscador.setAttribute("id", "")
        interfazBuscador.classList.remove("hidden")

        const contenedorResultados = interfazBuscador.querySelector(".buscador-clientes-resultados")
        const plantillaResultado = contenedorResultados.querySelector(".buscador-clientes-resultado")

        const campoBusqueda = interfazBuscador.querySelector(".buscador-clientes-busqueda")
        campoBusqueda.addEventListener("input", busquedaCambiada)

        // Controlamos cuándo se selecciona un Cliente
        contenedorResultados.addEventListener("click", clienteSeleccionado)

        // Creamos un modal con dicha interfaz
        const modalBuscador = new modals.Modal(interfazBuscador, () => {}, null, {
            class: "buscador-clientes-modal",
            mostrarBotonAceptar: false
        })
        modalBuscador.mostrar()

        //
        // Función llamada cada vez que cambia el campo de búsqueda para actualizar los resultados.
        //
        async function busquedaCambiada(evento) {

            if (evento.target.value.length > 2) {

                const busqueda = evento.target.value

                const clientes = await datos.buscarClientes(campoBusqueda.value)

                contenedorResultados.innerHTML = ""

                for (let cliente of clientes.clientes) {
                    const resultadoCliente = plantillaResultado.cloneNode(true)
                    resultadoCliente.classList.remove("hidden")

                    const htmlNombre = `<strong>${resaltar(cliente.nombre, busqueda)}</strong>`
                    resultadoCliente.querySelector(".buscador-clientes-nombre").innerHTML = htmlNombre
                    const htmlCIF = `CIF: ${resaltar(cliente.cif, busqueda)}`
                    resultadoCliente.querySelector(".buscador-clientes-cif").innerHTML = htmlCIF

                    resultadoCliente.dataset.clienteId = cliente.id

                    contenedorResultados.append(resultadoCliente)
                }
            }
        }

        //
        // Función llamada cuando se hace clic en un Cliente para seleccionarlo.
        //
        function clienteSeleccionado(evento) {

            const cliente = evento.target.closest(".buscador-clientes-resultado")
            const clienteId = cliente?.dataset?.clienteId

            if (clienteId) {
                modalBuscador.cerrar()
                seleccionarCliente(parseInt(clienteId))
            }
        }
    }

    //
    // Selecciona el Cliente con el Id indicado y lo muestra en la interfaz.
    //
    async function seleccionarCliente(id) {

        try {
            const cliente = await datos.cargarClientePorId(id)

            // Establecemos el Cliente seleccionado
            inputIdCliente.value = id
            vistaCliente.innerHTML = `<strong>${cliente.nombre}</strong>`

            clienteSeleccionado = cliente

            // Limpiamos y poblamos el selector de Contactos
            selectContactos.disabled = false
            const _ = [...document.querySelector("select").options]
                .filter(option => option.value != 0)
                .forEach(option => option.remove())

            for (let contacto of cliente.contactos) {

                const optionContacto = document.createElement("option")
                optionContacto.setAttribute("value", contacto.id)
                optionContacto.textContent = `${contacto.nombre} ${contacto.apellido1} ${contacto.apellido2}`

                selectContactos.append(optionContacto)
            }
        }
        catch (error) {
            modals.ErrorBox.mostrar("Ha habido un problema obteniendo información del Cliente")
        }
    }

    //
    // Calcula el importe total de la Factura teniendo en cuenta los Conceptos de ésta, su cantidad
    // y aplicando el IVA.
    //
    function calcularImporteTotal() {

        const vistaImporteFactura = document.querySelector(".factura-importe")
        const vistaBaseImponible = vistaImporteFactura.querySelector(".base-imponible-vista")
        const vistaImporteTotal = vistaImporteFactura.querySelector(".importe-total")

        // IVA
        const campoIVA = document.querySelector("#input-iva")
        const iva = parseFloat(campoIVA.value)

        if (campoIVA.value === "" || isNaN(iva)) {
            ocultarImporteTotal()
            return
        }

        let importeTotal = 0

        // Conceptos
        const conceptos = contenedorConceptos.querySelectorAll(".factura-concepto")

        if (conceptos.length === 0) {
            ocultarImporteTotal()
            return
        }

        for (let divConcepto of conceptos) {

            // Importe
            const campoImporte = divConcepto.querySelector("[name = 'input-importe']")
            const importe = parseFloat(campoImporte.value)

            if (campoImporte.value === "" || isNaN(importe)) {
                ocultarImporteTotal()
                return
            }

            importeTotal += importe
        }

        // Calculamos la base imponible y el importe total (+IVA)
        vistaImporteFactura.classList.remove("hidden")
        baseImponible = importeTotal
        vistaBaseImponible.innerHTML = `Base imponible: <strong>${formatoMoneda(importeTotal)}</strong>`
        importeTotal = baseImponible * (1 + (iva / 100))
        vistaImporteTotal.innerHTML = `Importe total: <strong>${formatoMoneda(importeTotal)}</strong>`

        //
        // Oculta la vista del importe total de la Factura.
        //
        function ocultarImporteTotal() {
            baseImponible = 0
            vistaBaseImponible.textContent = ""
            vistaImporteTotal.textContent = ""
            vistaImporteFactura.classList.add("hidden")
        }
    }
}

//
// Muestra la interfaz para edirar una Factura.
//
async function editarFactura(idFactura) {

    contenedorMain.innerHTML = ""

    document.querySelector("#h1-apartado").textContent = "Editar factura"

    // Obtenemos los datos de la factura
    const datosFactura = await datos.cargarFacturaPorId(idFactura)

    // Clona y muestra la interfaz con los campos de la Factura
    const plantillaEditarFactura = document.querySelector("#factura-new-template")

    const divEditarFactura = plantillaEditarFactura.cloneNode(true)
    divEditarFactura.setAttribute("id", "")
    divEditarFactura.classList.remove("hidden")

    // Poblamos los campos
    const campoFechaFactura = divEditarFactura.querySelector("#input-fecha-emision")
    campoFechaFactura.value = datosFactura["fecha_emision"]

    // Controlamos el IVA para calcular el importe total
    const campoIVA = divEditarFactura.querySelector("#input-iva")
    campoIVA.value = parseInt(datosFactura.iva)
    campoIVA.addEventListener("input", e => {
        const iva = parseFloat(e.target.value)
        if (!isNaN(iva))
            calcularImporteTotal()
    })

    contenedorMain.append(divEditarFactura)

    // Controlamos el botón de búsqueda de Cliente
    let clienteSeleccionado = null
    const inputIdCliente = divEditarFactura.querySelector("input[name = 'input-id-cliente']")
    const vistaCliente = divEditarFactura.querySelector(".cliente-vista")
    divEditarFactura.querySelector("#buscar-cliente-btn").addEventListener("click", buscarCliente)

    const selectContactos = divEditarFactura.querySelector("select[name = 'contacto-select']")

    await seleccionarCliente(datosFactura["id_cliente"])

    // Cambia la barra de acciones
    cambiarBarraDeAcciones()

    // Añade los conceptos de la factura
    const plantillaNuevoConcepto = document.querySelector("#concepto-template")
    const contenedorConceptos = divEditarFactura.querySelector(".listado-conceptos")
    contenedorConceptos.innerHTML = ""
    agregarConceptos(datosFactura.items)

    // Calculamos el importe total para la factura
    let baseImponible = 0
    calcularImporteTotal()

    //
    // Quita la barra de acciones general y muestra las acciones de creación.
    //
    function cambiarBarraDeAcciones() {

        const barraAcciones = document.querySelector("#acciones")
        // barraAcciones.innerHTML = ""

        barraAcciones.querySelector("#nueva-factura-btn").remove()
        barraAcciones.querySelector("#paginacion").remove()
        barraAcciones.querySelector("#buscador").remove()

        const accionesCreacion = barraAcciones.querySelector("#acciones-edicion")
        accionesCreacion.classList.remove("hidden")

        const botonNuevoConcepto = accionesCreacion.querySelector(".boton-nuevo-concepto")
        botonNuevoConcepto.addEventListener("click", crearConcepto)

        const botonGuardarFactura = accionesCreacion.querySelector(".boton-guardar-factura")
        botonGuardarFactura.addEventListener("click", guardarFactura)
    }

    //
    // Llama a la API para guardar los cambios en la Factura.
    //
    async function guardarFactura() {

        // Recalculamos la base imponible y, con el IVA, el importe total
        calcularImporteTotal()

        const datosFactura = componerObjetoFactura()

        // Validamos
        if (validarFactura(datosFactura)) {

            try {
                const respuesta = await datos.actualizarFactura(datosFactura)
                console.log(respuesta)
                modals.InfoBox.mostrar("Factura actualizada correctamente.")
            }
            catch (error) {
                modals.ErrorBox.mostrar(`ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`)
            }
        }

        //
        // Convierte los datos de la Factura y sus Conceptos en un objeto que se puede validar o enviar.
        //
        function componerObjetoFactura() {

            const datos = {}

            // Id
            datos.idFactura = idFactura

            // IVA
            const campoIVA = document.querySelector("#input-iva")
            const iva = parseFloat(campoIVA.value)

            if (campoIVA.value !== "" && !isNaN(iva))
                datos.iva = iva

            // Base imponible
            if (baseImponible != 0)
                datos.baseImponible = baseImponible

            // Cliente
            const idCliente = clienteSeleccionado?.id ?? 0

            if (idCliente != 0)
                datos.idCliente = idCliente

            // Contacto del Cliente
            const idContacto = selectContactos.value

            if (idContacto != 0)
                datos.idContacto = idContacto

            // Fecha de emisión
            if (campoFechaFactura.valueAsDate != null)
                datos.fechaEmision = campoFechaFactura.value

            // Conceptos
            datos.conceptos = []
            const conceptos = contenedorConceptos.querySelectorAll(".factura-concepto")
            for (let divConcepto of conceptos) {

                const datosConcepto = {}

                // Acción
                datosConcepto.accion = divConcepto.dataset?.accion ?? "actualizar"

                // Id
                datosConcepto.id = divConcepto.dataset?.idConcepto ?? 0

                // Descripción
                const descripcion = divConcepto.querySelector("[name = 'descripcion-concepto']")
                datosConcepto.descripcion = descripcion.value

                // Importe
                const campoImporte = divConcepto.querySelector("[name = 'input-importe']")
                const importe = parseFloat(campoImporte.value)

                if (campoImporte.value !== "" && !isNaN(importe))
                    datosConcepto.importe = importe

                datos.conceptos.push(datosConcepto)
            }

            return datos
        }

        //
        // Valida que los datos de la nueva Factura sean correctos.
        //
        function validarFactura(datosFactura) {

            let errores = ""

            if (datosFactura.iva === undefined)
                errores = "No se ha indicado un porcentaje de IVA correcto.<br>"

            if (datosFactura.idCliente === undefined)
                errores += "No se ha elegido ningún Cliente.<br>"
            if (datosFactura.idContacto === undefined)
                errores += "No se ha elegido ningún Contacto.<br>"

            if (datosFactura.fechaEmision === undefined)
                errores += "No se ha indicado la fecha de emisión.<br>"

            if (datosFactura.conceptos.length === 0)
                errores += `La factura no tiene ningún concepto.<br>`
            else
                datosFactura.conceptos.forEach((datosConcepto, i) => {

                    if (datosConcepto.importe === undefined)
                        errores += `No se ha indicado importe para el concepto ${i + 1}.<br>`

                    if (datosConcepto.descripcion === undefined)
                        errores += `No se ha indicado descripción para el concepto ${i + 1}.<br>`
                })

            // Si tenemos algún error, la factura NO es válida
            if (errores != "") {
                modals.ErrorBox.mostrar("<p><strong>No se puede guardar la Factura porque contiene datos no válidos</strong></p>" + errores)
                return false
            }

            return true
        }
    }

    //
    // Agrega a la interfaz de edición los Conceptos de la Factura actual.
    //
    function agregarConceptos(conceptos) {

        for (let concepto of conceptos) {
            const divNuevoConcepto = plantillaNuevoConcepto.cloneNode(true)
            divNuevoConcepto.classList.remove("hidden")
            divNuevoConcepto.setAttribute("id", "")

            divNuevoConcepto.dataset.idConcepto = concepto.id

            const textareaDescripcion = divNuevoConcepto.querySelector("[name = 'descripcion-concepto']")
            textareaDescripcion.value = concepto.descripcion
            textareaDescripcion.addEventListener("input", () => {
                // Señalizamos que el concepto debe ser actualizado
                divNuevoConcepto.dataset.accion = "actualizar"
            })

            const inputImporte = divNuevoConcepto.querySelector("[name = 'input-importe']")
            inputImporte.value = concepto.importe
            inputImporte.addEventListener("input", e => {

                // Señalizamos que el concepto debe ser actualizado
                divNuevoConcepto.dataset.accion = "actualizar"

                const importe = parseFloat(e.target.value)
                if (!isNaN(importe))
                    calcularImporteTotal()
            })

            divNuevoConcepto.querySelector(".eliminar-concepto").addEventListener("click", () => {

                // Señalizamos que el concepto debe ser borrado y lo ocultamos
                divNuevoConcepto.classList.add("hidden")
                divNuevoConcepto.dataset.accion = "borrar"

                // Ponemos en su lugar el hueco
                crearHuecoDeConceptoBorrado(divNuevoConcepto, () => {

                    // Revertimos el borrado del Concepto y lo mostramos
                    divNuevoConcepto.classList.remove("hidden")
                    divNuevoConcepto.dataset.accion = "actualizar"
                })

                calcularImporteTotal()
            })

            contenedorConceptos.append(divNuevoConcepto)
        }
    }

    //
    // Crea un nuevo Concepto para la Factura actual.
    //
    function crearConcepto() {

        const divNuevoConcepto = plantillaNuevoConcepto.cloneNode(true)
        divNuevoConcepto.classList.remove("hidden")
        divNuevoConcepto.setAttribute("id", "")

        // Señalizamos que el concepto es nuevo y se debe crear
        divNuevoConcepto.dataset.accion = "crear"

        divNuevoConcepto.querySelector("[name = 'input-importe']").addEventListener("input", e => {
            const importe = parseFloat(e.target.value)
            if (!isNaN(importe))
                calcularImporteTotal()
        })

        divNuevoConcepto.querySelector(".eliminar-concepto").addEventListener("click", () => {
            divNuevoConcepto.parentNode.removeChild(divNuevoConcepto)
            calcularImporteTotal()
        })

        const primerConcepto = contenedorConceptos.querySelector(".factura-concepto")
        if (primerConcepto)
            primerConcepto.before(divNuevoConcepto)
        else
            contenedorConceptos.append(divNuevoConcepto)
    }

    //
    // Crea un "hueco" para un Concepto borrado de forma que se pueda revertir la acción de borrado.
    //
    function crearHuecoDeConceptoBorrado(divConcepto, accion) {

        const hueco = document.createElement("div")
        hueco.classList.add("hueco-concepto")

        const texto = document.createElement("span")
        texto.textContent = "El concepto ha sido borrado."

        const deshacer = document.createElement("a")
        deshacer.href = "#"
        deshacer.textContent = "Deshacer"
        deshacer.addEventListener("click", e => {
            e.preventDefault()

            // Ejecuta la acción de deshacer y elimina el hueco
            accion()
            hueco.remove()
        })

        hueco.append(texto, deshacer)

        divConcepto.before(hueco)
    }

    //
    // Muestra un diálogo modal para que el usuario elija un Cliente al que asignar la Factura.
    //
    function buscarCliente() {

        // Clonamos la interfaz del buscador
        const interfazBuscador = plantillaBuscadorClientes.cloneNode(true)
        interfazBuscador.setAttribute("id", "")
        interfazBuscador.classList.remove("hidden")

        const contenedorResultados = interfazBuscador.querySelector(".buscador-clientes-resultados")
        const plantillaResultado = contenedorResultados.querySelector(".buscador-clientes-resultado")

        const campoBusqueda = interfazBuscador.querySelector(".buscador-clientes-busqueda")
        campoBusqueda.addEventListener("input", busquedaCambiada)

        // Controlamos cuándo se selecciona un Cliente
        contenedorResultados.addEventListener("click", clienteSeleccionado)

        // Creamos un modal con dicha interfaz
        const modalBuscador = new modals.Modal(interfazBuscador, () => {}, null, {
            class: "buscador-clientes-modal",
            mostrarBotonAceptar: false
        })
        modalBuscador.mostrar()

        //
        // Función llamada cada vez que cambia el campo de búsqueda para actualizar los resultados.
        //
        async function busquedaCambiada(evento) {

            if (evento.target.value.length > 2) {

                const busqueda = evento.target.value

                const clientes = await datos.buscarClientes(campoBusqueda.value)

                contenedorResultados.innerHTML = ""

                for (let cliente of clientes.clientes) {
                    const resultadoCliente = plantillaResultado.cloneNode(true)
                    resultadoCliente.classList.remove("hidden")

                    const htmlNombre = `<strong>${resaltar(cliente.nombre, busqueda)}</strong>`
                    resultadoCliente.querySelector(".buscador-clientes-nombre").innerHTML = htmlNombre
                    const htmlCIF = `CIF: ${resaltar(cliente.cif, busqueda)}`
                    resultadoCliente.querySelector(".buscador-clientes-cif").innerHTML = htmlCIF

                    resultadoCliente.dataset.clienteId = cliente.id

                    contenedorResultados.append(resultadoCliente)
                }
            }
        }

        //
        // Función llamada cuando se hace clic en un Cliente para seleccionarlo.
        //
        function clienteSeleccionado(evento) {

            const cliente = evento.target.closest(".buscador-clientes-resultado")
            const clienteId = cliente?.dataset?.clienteId

            if (clienteId) {
                modalBuscador.cerrar()
                seleccionarCliente(parseInt(clienteId))
            }
        }
    }

    //
    // Selecciona el Cliente con el Id indicado y lo muestra en la interfaz.
    //
    async function seleccionarCliente(id) {

        try {
            const cliente = await datos.cargarClientePorId(id)

            // Establecemos el Cliente seleccionado
            inputIdCliente.value = id
            vistaCliente.innerHTML = `<strong>${cliente.nombre}</strong>`

            clienteSeleccionado = cliente

            // Limpiamos y poblamos el selector de Contactos
            selectContactos.disabled = false
            const _ = [...document.querySelector("select").options]
                .filter(option => option.value != 0)
                .forEach(option => option.remove())

            for (let contacto of cliente.contactos) {

                const optionContacto = document.createElement("option")
                optionContacto.setAttribute("value", contacto.id)
                optionContacto.textContent = `${contacto.nombre} ${contacto.apellido1} ${contacto.apellido2}`

                selectContactos.append(optionContacto)
            }
        }
        catch (error) {
            modals.ErrorBox.mostrar("Ha habido un problema obteniendo información del Cliente")
        }
    }

    //
    // Calcula el importe total de la Factura teniendo en cuenta los Conceptos de ésta, su cantidad
    // y aplicando el IVA.
    //
    function calcularImporteTotal() {

        const vistaImporteFactura = document.querySelector(".factura-importe")
        const vistaBaseImponible = vistaImporteFactura.querySelector(".base-imponible-vista")
        const vistaImporteTotal = vistaImporteFactura.querySelector(".importe-total")

        // IVA
        const campoIVA = document.querySelector("#input-iva")
        const iva = parseFloat(campoIVA.value)

        if (campoIVA.value === "" || isNaN(iva)) {
            ocultarImporteTotal()
            return
        }

        let importeTotal = 0

        // Conceptos
        const conceptos = contenedorConceptos.querySelectorAll(".factura-concepto")

        if (conceptos.length === 0) {
            ocultarImporteTotal()
            return
        }

        for (let divConcepto of conceptos) {

            // Importe
            const campoImporte = divConcepto.querySelector("[name = 'input-importe']")
            const importe = parseFloat(campoImporte.value)

            if (campoImporte.value === "" || isNaN(importe)) {
                ocultarImporteTotal()
                return
            }

            importeTotal += importe
        }

        // Calculamos la base imponible y el importe total (+IVA)
        vistaImporteFactura.classList.remove("hidden")
        baseImponible = importeTotal
        vistaBaseImponible.innerHTML = `Base imponible: <strong>${formatoMoneda(importeTotal)}</strong>`
        importeTotal = baseImponible * (1 + (iva / 100))
        vistaImporteTotal.innerHTML = `Importe total: <strong>${formatoMoneda(importeTotal)}</strong>`

        //
        // Oculta la vista del importe total de la Factura.
        //
        function ocultarImporteTotal() {
            baseImponible = 0
            vistaBaseImponible.textContent = ""
            vistaImporteTotal.textContent = ""
            vistaImporteFactura.classList.add("hidden")
        }
    }
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

getFacturas()
