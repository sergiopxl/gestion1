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

getFacturas()
