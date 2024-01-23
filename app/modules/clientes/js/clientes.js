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
                printListaClientes(clientes.numero_clientes, clientes.clientes, busquedaActiva, busqueda)
            })
        )
    }

    // Lista los clientes en la interfaz
    function printListaClientes(numClientes, clientes, busquedaActiva, busqueda) {

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
                ? "<h2 class=\"paginacion-resultados\">1 cliente encontrado</h2>"
                : `<h2 class=\"paginacion-resultados\">${numClientes} clientes encontrado</h2>`
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

            printListaContactos(clienteContenedor, cliente.contactos)

            contenedorListado.append(clienteContenedor)
        });
    }

    // Edita el contacto seleccionado
    function doEditar(cliente) {

        const bloqueFormulario = document.querySelector("#bloque-formulario").cloneNode(true)
        bloqueFormulario.classList.remove("hidden")

        const formEditarCliente = bloqueFormulario.querySelector("#cliente-formulario")
        
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
        getSectoresClientes()

        const botonEnviar = bloqueFormulario.querySelector("#formulario-boton-enviar")
        botonEnviar.addEventListener("click", e => {
            e.preventDefault()

            const datosFormulario = new FormData(formEditarCliente)

            fetch(apiUrlClientesUpdate, { method: "POST", body: datosFormulario })
                .then(respuesta => respuesta.json()
                .then(data => console.log(data)))
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

        // Llama a la API para obtener los sectores disponibles para el cliente.
        function getSectoresClientes() {

            fetch(apiUrlClientesSectoresGet, { method: "GET" })
                .then(respuesta => respuesta.json()
                .then(sectores => 
                    sectores.forEach(sector => {

                        const opcionSector = document.createElement("option")
                        opcionSector.value = sector.id
                        opcionSector.textContent = sector.nombre

                        if (sector.id == cliente.id_sector)
                            opcionSector.setAttribute("selected", "selected")

                        campoSector.append(opcionSector)
                    })
                )
            )
        }

        // Compone la interfaz para mostrar, editar y eliminar contactos de un cliente.
        function setContactos() {

            const contenedorContactos = bloqueFormulario.querySelector("#cliente-contactos-contenedor-formulario")
            const contactoFormulario = contenedorContactos.querySelector(".cliente-contactos-form")

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
                    
                    const datosFormulario = new FormData(nuevoFormularioContacto)

                    fetch(apiUrlClientesContactoUpdate, { method: "POST", body: datosFormulario })
                        .then(respuesta => respuesta
                        .json()
                        .then(data => console.log(data)))
                })
                const botonEliminar = nuevoFormularioContacto.querySelector("button.eliminar")
                botonEliminar.addEventListener("click", e => {
                    e.preventDefault()

                    fetch(`${apiUrlClientesContactoDelete}?contacto-id=${contacto.id}`, { method: "GET" })
                        .then(respuesta => respuesta
                        .json()
                        .then(data => {
                            nuevoFormularioContacto.innerHTML = "<p>EL contacto ha sido eliminado.</p>"
                            console.log(data)
                        })
                )})

                nuevoFormularioContacto.classList.remove("hidden")
                contenedorContactos.append(nuevoFormularioContacto)
            })
        }
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

    // Devuelve un HTML donde aparecen resaltados los términos de búsqueda.
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
}

doClientes()