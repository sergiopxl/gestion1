"use strict"

console.log("proveedores.js v1.0")

function doProveedores() {

    let paginaActual = 1
    const resultadosPorPagina = 20

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

        const campoServicio = formNuevoProveedor.querySelector("[name = 'select-proveedor-servicio']")
        getServiciosProveedores(campoServicio)

        // Cambiamos la vista a la de creación
        const titulo = document.querySelector("#h1-apartado")
        titulo.textContent = "Nuevo proveedor"
        const barraAcciones = document.querySelector("#acciones")
        barraAcciones.classList.add("hidden")
        contenedorListado.innerHTML = ""
        contenedorListado.append(bloqueFormulario)
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

        const botonEnviar = bloqueFormulario.querySelector(".formulario-boton-enviar")
        botonEnviar.textContent = "Guardar cambios"

        // Cambiamos la vista a la de edición
        const titulo = document.querySelector("#h1-apartado")
        titulo.textContent = "Editar proveedor"
        const barraAcciones = document.querySelector("#acciones")
        barraAcciones.classList.add("hidden")
        contenedorListado.innerHTML = ""
        contenedorListado.append(bloqueFormulario)
    }

    //
    // Llama a la API para obtener los Servicios disponibles para el Proveedor.
    //
    function getServiciosProveedores(selectServicio, proveedor) {

        fetch(apiUrlProveedoresServiciosGet, { method: "GET" })
            .then(respuesta => respuesta.json()
                .then(servicios =>
                    servicios.forEach(servicio => {

                        const opcionServicio = document.createElement("option")
                        opcionServicio.value = servicio.id
                        opcionServicio.textContent = servicio.name

                        if (proveedor && servicio.id == proveedor.id_servicio)
                            opcionServicio.setAttribute("selected", "selected")

                        selectServicio.append(opcionServicio)
                    })
                )
            )
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
}

doProveedores()
