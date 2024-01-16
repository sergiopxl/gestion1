"use strict"

console.log("clientes.js v1.0")

function doClientes() {

    let paginaActual = 1
    const resultadosPorPagina = 20

    const contenedorListado = document.querySelector("main")
    const templateCliente = document.querySelector(".cliente-row")
    const templateContacto = document.querySelector(".contactos-contacto")

    function getClientes(actual) {

        if (actual)
            paginaActual = actual

        const inicio = paginaActual > 1
            ? (paginaActual - 1) * resultadosPorPagina
            : 0
        const parametroInicio = `?inicio=${inicio}`
        const parametroPorPagina = `&porpagina=${resultadosPorPagina}`

        const url = apiUrlClientesGet + parametroInicio + parametroPorPagina

        fetch(url, { method: "GET" }).then(respuesta =>
            respuesta.json().then(clientes => {
                printListaClientes(clientes.numero_clientes, clientes.clientes)
            })
        )
    }

    function printListaClientes(numClientes, clientes) {

        contenedorListado.innerHTML = ""

        // Preparamos la paginación
        doPaginacion(paginaActual, resultadosPorPagina, numClientes, getClientes)

        // Imprime los clientes devueltos
        clientes.forEach(cliente => {
            const clienteContenedor = templateCliente.cloneNode(true)

            clienteContenedor.classList.remove("hidden")

            clienteContenedor.querySelector(".cliente-datos-nombre").textContent = cliente.nombre;
            clienteContenedor.querySelector(".cliente-datos-cif").textContent = cliente.cif;
            clienteContenedor.querySelector(".cliente-datos-tlf").textContent = cliente.telefono;
            clienteContenedor.querySelector(".cliente-datos-direccion").textContent = cliente.direccion;
            clienteContenedor.querySelector(".cliente-datos-sector").textContent = "";

            printListaContactos(clienteContenedor, cliente.contactos)

            contenedorListado.append(clienteContenedor)
        });
    }

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

    getClientes()
}

doClientes()