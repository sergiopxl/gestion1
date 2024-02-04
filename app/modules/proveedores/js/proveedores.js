"use strict"

console.log("proveedores.js v1.0")

function doProveedores() {

    let paginaActual = 1
    const resultadosPorPagina = 20

    const contenedorListado = document.querySelector("main")
    const templateProveedor = document.querySelector(".proveedor-row")
    const templateContacto = document.querySelector(".contactos-contacto")

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
    function getProveedores(pagina, busqueda) {

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

        // Búsqueda
        let busquedaActiva = false
        let parametroBusqueda = ""
        if (busqueda && busqueda != "") {
            parametroBusqueda = `&buscar=${busqueda}`
            parametroPorPagina = "&porpagina=99999"
            busquedaActiva = true
        }

        // Hace la llamada GET al API e imprime los resultados
        const url = apiUrlProveedoresGet + parametroInicio + parametroPorPagina + parametroBusqueda

        // Muestra un "Cargando proveedores..." si la carga tarda
        const loader = new Loader({ mensaje: "Cargando proveedores..." })

        fetch(url, { method: "GET" })
            .then(respuesta => {

                if (!respuesta.ok)
                    throw new Error(`Error en la solicitud: ${respuesta.status}`)
                else
                    return respuesta.json()
            })
            .then(proveedores => {

                printListaProveedores(proveedores.numero_proveedores, proveedores.proveedores, busquedaActiva, busqueda)
                loader.destroy()
            })
            .catch(error => {

                loader.destroy()
                const mensajeError = `ERROR <br> ${error} <br> Consulte con el servicio de atención al proveedor.`
                new Modal(mensajeError, "error")
            })
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

            doPaginacion(paginaActual, resultadosPorPagina, numProveedores, getProveedores)
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

            printListaContactos(proveedorContenedor, proveedor.contactos)

            contenedorListado.append(proveedorContenedor)
        });
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
}

doProveedores()
