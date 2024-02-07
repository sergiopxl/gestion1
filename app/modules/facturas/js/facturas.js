import { navegacion } from "../../../assets/js/navegacion.js"
import { paginacion } from "../../../assets/js/paginacion.js"
import { Loader } from "../../../assets/js/loader.js"
import { Modal } from "../../../assets/js/modal.js"
import { formatoMoneda } from "../../../assets/js/formato_moneda.js"
import { fechaCorta } from "../../../assets/js/formato_fecha.js"
import { UrlFacturasGet } from "../../../assets/js/api_roots.js"

console.log("facturas.js 1.1")

navegacion()

let paginaActual = 1
const resultadosPorPagina = 20

const contenedorMain = document.querySelector("main")
const plantillaFacturaRow = document.querySelector("#factura-template")
const plantillaFacturaItem = document.querySelector("#factura-item-template")

const botonNuevaFactura = document.querySelector("#nueva-factura-btn")
botonNuevaFactura.addEventListener("click", () => nuevaFactura())

//
// Carga las Facturas.
// Imprime las Facturas en la interfaz.
//
function getFacturas(pagina) {

    // Volvemos la vista a la parte superior cuando se cambia de página
    scroll({ top: 0, left: 0, behavior: "smooth" })

    // Paginación
    if (pagina)
        paginaActual = pagina

    const inicio = paginaActual > 1
        ? (paginaActual - 1) * resultadosPorPagina
        : 0
    const parametroInicio = `?inicio=${inicio}`
    let parametroPorPagina = `&porpagina=${resultadosPorPagina}`

    // Hace la llamada GET al API e imprime los resultados
    const url = UrlFacturasGet + parametroInicio + parametroPorPagina

    // Muestra un mensaje si la carga tarda
    const loader = new Loader({ mensaje: "Cargando facturas..." })

    fetch(url, { method: "GET" })
        .then(respuesta => {

            if (!respuesta.ok)
                throw new Error(`Error en la solicitud: ${respuesta.status}`)
            else
                return respuesta.json()
        })
        .then(facturas => {

            printFacturas(facturas.numero_facturas, facturas.facturas)
            loader.destroy()
        })
        .catch(error => {

            loader.destroy()
            const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al cliente.`
            new Modal(mensajeError, "error")
        })
}

//
// Imprime la lista de las Facturas en la interfaz.
//
function printFacturas(numFacturas, facturas) {

    contenedorMain.innerHTML = ""

    // Preparamos la paginación
    document.querySelector("#paginacion").innerHTML = "<ul></ul>"
    paginacion(paginaActual, resultadosPorPagina, numFacturas, getFacturas)

    // Imprime una fila por cada factura
    for (let factura of facturas) {

        const facturaRow = plantillaFacturaRow.cloneNode(true)
        facturaRow.setAttribute("id", "")
        facturaRow.classList.remove("hidden")

        const baseImponible = parseFloat(factura.baseimponible)
        const iva = parseFloat(factura.iva) / 100
        const importe = baseImponible * (1 + iva)

        // Poblamos los datos de la factura y el cliente
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
    divNuevaFactura.querySelector("#buscar-cliente-btn").addEventListener("click", buscarCliente)

    contenedorMain.append(divNuevaFactura)

    const plantillaNuevoConcepto = document.querySelector("#concepto-template")

    // Cambia la barra de acciones
    const barraAcciones = document.querySelector("#acciones")
    barraAcciones.innerHTML = ""

    const contenedorConceptos = divNuevaFactura.querySelector(".listado-conceptos")
    contenedorConceptos.innerHTML = ""

    const botonNuevoConcepto = document.createElement("button")
    botonNuevoConcepto.textContent = "Nuevo concepto"
    botonNuevoConcepto.classList.add("btn-success")
    botonNuevoConcepto.addEventListener("click", () => crearConcepto())

    const botonGuardarCliente = document.createElement("button")
    botonGuardarCliente.textContent = "Guardar cambios"
    botonGuardarCliente.classList.add("btn-success")
    botonGuardarCliente.addEventListener("click", () => guardarNuevaFactura())

    barraAcciones.append(botonNuevoConcepto, botonGuardarCliente)

    //
    // Llama a la API para guardar la nueva Factura.
    //
    function guardarNuevaFactura() {

        const datos = componerObjetoFactura()

        // Validamos
        if (validarFactura(datos)) {

            console.log(datos)

            const json = JSON.stringify(datos)
            console.log(json)

            // TODO: Enviar datos al API
            // TODO: Informar del resultado
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

            // Cliente
            const idCliente = 0

            if (idCliente != 0)
                datos.idCliente = idCliente

            // Contacto del Cliente
            const idContacto = 0

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
                const mensajeError = "<p><strong>No se puede guardar la Factura porque contiene datos no válidos</strong></p>"
                                   + errores

                new Modal(mensajeError, "error")
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
    function buscarCliente(contenedorConceptos) {

        // TODO: Mostrar un modal con un buscador de Clientes para seleccionar uno

        function getClientes(consulta) {
            // TODO: Llama a la API para buscar Clientes
        }
    }

    //
    // Calcula el importe total de la Factura teniendo en cuenta los Conceptos de ésta, su cantidad
    // y aplicando el IVA.
    //
    function calcularImporteTotal() {

        const vistaBaseImponible = document.querySelector(".base-imponible-vista")
        const vistaImporteTotal = document.querySelector(".importe-total")

        // IVA
        const campoIVA = document.querySelector("#input-iva")
        const iva = parseFloat(campoIVA.value)

        if (campoIVA.value === "" || isNaN(iva)) {
            vistaBaseImponible.textContent = ""
            vistaImporteTotal.textContent = ""
            return
        }

        let importeTotal = 0

        // Conceptos
        const conceptos = contenedorConceptos.querySelectorAll(".factura-concepto")

        if (conceptos.length === 0) {
            vistaBaseImponible.textContent = ""
            vistaImporteTotal.textContent = ""
            return
        }

        for (let divConcepto of conceptos) {

            // Importe
            const campoImporte = divConcepto.querySelector("[name = 'input-importe']")
            const importe = parseFloat(campoImporte.value)

            if (campoImporte.value === "" || isNaN(importe)) {
                vistaBaseImponible.textContent = ""
                vistaImporteTotal.textContent = ""
                return
            }

            importeTotal += importe
        }

        // Calculamos la base imponible y el importe total (+IVA)
        vistaBaseImponible.textContent = formatoMoneda(importeTotal)
        importeTotal = importeTotal * (1 + (iva / 100))
        vistaImporteTotal.textContent = formatoMoneda(importeTotal)
    }
}

getFacturas()
