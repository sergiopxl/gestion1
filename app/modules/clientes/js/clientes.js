"use strict"

console.log("clientes.js v1.0")

function doClientes() {

    let paginaActual = 1
    const resultadosPorPagina = 20

    const contenedorListado = document.querySelector("main")
    const templateCliente = document.querySelector(".cliente-row")
    const templateContacto = document.querySelector(".contactos-contacto")

    // Prepara el buscador de clientes
    const buscadorTexto = document.querySelector("#buscador-input")
    const buscadorBoton = document.querySelector("#buscador-boton")

    buscadorBoton.addEventListener("click", () => {
        const busqueda = buscadorTexto.value
        if (busqueda != "") {
            getClientes(paginaActual = 1, busqueda)
        }
    })

    // Función de carga de los clientes de una página en concreto y con una
    // expresión de búsqueda.
    function getClientes(pagina, busqueda) {

        // Paginación
        if (pagina)
            paginaActual = pagina

        const inicio = paginaActual > 1
            ? (paginaActual - 1) * resultadosPorPagina
            : 0
        const parametroInicio = `?inicio=${inicio}`
        let parametroPorPagina = `&porpagina=${resultadosPorPagina}`

        // Búsqueda
        let busquedaActiva = false
        let parametroBusqueda = ""
        if (busqueda && busqueda != "") {
            parametroBusqueda = `&buscar=${busqueda}`
            parametroPorPagina = "&porpagina=99999"
            busquedaActiva = true
        }

        // Hace la llamada GET al API e imprime los resultados
        const url = apiUrlClientesGet + parametroInicio + parametroPorPagina + parametroBusqueda

        fetch(url, { method: "GET" }).then(respuesta =>
            respuesta.json().then(clientes => {
                printListaClientes(clientes.numero_clientes, clientes.clientes, busquedaActiva)
            })
        )
    }

    // Lista los clientes en la interfaz
    function printListaClientes(numClientes, clientes, busquedaActiva) {

        contenedorListado.innerHTML = ""

        // Preparamos la paginación
        if (!busquedaActiva) {
            buscadorTexto.value = ""
            document.querySelector("#paginacion").innerHTML = "<ul></ul>"

            doPaginacion(paginaActual, resultadosPorPagina, numClientes, getClientes)
        } else {
            const botonVerTodos = document.createElement("button")
            botonVerTodos.classList.add("btn-info")
            botonVerTodos.textContent = "Ver listado completo"
            botonVerTodos.addEventListener("click", () => getClientes())

            document.querySelector("#paginacion").innerHTML = numClientes == 1
                ? "<h2>1 cliente encontrado</h2>"
                : `<h2>${numClientes} clientes encontrado</h2>`
            document.querySelector("#paginacion").append(botonVerTodos)
        }

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

    // Lista los contactos de un cliente en la interfaz
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