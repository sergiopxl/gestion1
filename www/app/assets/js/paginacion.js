console.log("paginacion.js 2.0")

const defaultRegistrosPorPagina = 20
const defaultNumElementosPaginacion = 10

/**
 * Define parámetros necesarios por la paginación para determinar cómo se construye
 * la interfaz.
 */
export class PaginationOptions {

    static defaultRegistrosPorPagina = defaultRegistrosPorPagina
    static defaultNumElementosPaginacion = defaultNumElementosPaginacion

    /**
     * Número de registros a presentar en una página como máximo.
     * El valor por defecto es 20.
     * @type {number}
     */
    registrosPorPagina = defaultRegistrosPorPagina
    /**
     * Número de elementos de paginación a dibujar como máximo. A partir de dicho número, si
     * hay más páginas, se incluirán botones para pasar al grupo anterior o siguiente.
     * El valor por defecto es 10.
     * @type {number}
     */
    numElementosPaginacion = defaultNumElementosPaginacion

    /**
     * Selector CSS para identificar el elemento `<ul>` donde insertar los elementos de paginación
     * (que se añadirán como elementos `<li>`).
     * @type {string}
     */
    selectorPaginacionUl = "#paginacion > ul"

    /**
     * Número total de registros a mostrar de forma paginada.
     * @type {number}
     */
    totalRegistros
    /**
     * Número de la página actual. La primera página es la 1.
     * @type {number}
     */
    paginaActual = 1
}

// Representa un <li> clicable para que el usuario pueda cambiar de página
class ElementoPaginacion {

    elementoHtml = document.createElement("li")

    constructor(esPaginaActual, activado, pagina, texto) {

        this.elementoHtml.classList.add("elemento-paginacion")
        if (esPaginaActual)
            this.elementoHtml.classList.add("elemento-paginacion-activo")
        if (!activado)
            this.elementoHtml.setAttribute("disabled", "true")

        this.elementoHtml.innerHTML = texto
        this.elementoHtml.dataset.pagina = pagina
    }
}

/**
 * Permite componer la interfaz de paginación para un conjunto de elementos que se
 * debe presentar en páginas.
 */
export class Pagination {

    /**
     * Inicializa la paginación, creando los elementos de paginación para que el usuario pueda ver
     * una colección de registros de forma paginada, es decir, con un número máximo de registros y
     * la posibilidad de cambiar de página.
     *
     * @param {PaginationOptions} opciones - Opciones que determinan cómo funcionará la paginación.
     * @param {function} accion - Función a ejecutar cuando el usuario hace clic en la paginación
     *                            para cargar la página indicada.
     *                            Puede recibir como parámetro el número de página al que cambiar.
     */
    constructor(opciones, accion) {

        // Vaciamos la paginación
        const contenedorPaginacion = document.querySelector(opciones.selectorPaginacionUl)
        contenedorPaginacion.innerHTML = ""

        const numPaginas = Math.ceil( opciones.totalRegistros / opciones.registrosPorPagina )
        const numGrupos = Math.ceil( numPaginas / opciones.numElementosPaginacion )

        const grupoActual = Math.ceil( opciones.paginaActual / opciones.numElementosPaginacion )

        const grupoPagInicio = paginaInicioDeGrupo(grupoActual)
        const grupoPagFin = Math.min(paginaFinDeGrupo(grupoActual), numPaginas)

        // Si hay más de un grupo, ponemos la flecha de anterior grupo
        if (numGrupos > 1) {
            const anteriorActivado = grupoActual > 1
            const anterior = new ElementoPaginacion(false, anteriorActivado, "anterior", '<i class="fa-solid fa-arrow-left"></i>')
            contenedorPaginacion.append(anterior.elementoHtml)
        }

        // Crea un ElementoPaginacion por cada página de resultados
        for (let pag = grupoPagInicio; pag <= grupoPagFin; pag++) {

            const esPagActiva = (pag == opciones.paginaActual)
            const elemento = new ElementoPaginacion(esPagActiva, true, pag, pag)

            contenedorPaginacion.append(elemento.elementoHtml)
        }

        // Si hay más de un grupo, ponemos la flecha de siguiente grupo
        if (numGrupos > 1) {
            const siguienteActivado = grupoActual < numGrupos
            const siguiente = new ElementoPaginacion(false, siguienteActivado, "siguiente", '<i class="fa-solid fa-arrow-right"></i>')
            contenedorPaginacion.append(siguiente.elementoHtml)
        }

        // Controlamos las acciones del usuario sobre la paginación
        contenedorPaginacion.addEventListener("click", activarElemento)

        //
        // Evento ejecutado cuando el usuario pulsa uno de los elementos de paginación.
        //
        function activarElemento(evento) {

            // Comprobamos el tipo de evento
            const elementoPaginacion = evento.target.closest(".elemento-paginacion")

            // Si está desactivado, lo ignoramos
            if (elementoPaginacion && elementoPaginacion.attributes["disabled"]) {
                return
            }

            switch (elementoPaginacion?.dataset?.pagina) {

                case "anterior":
                    const anteriorPag = paginaFinDeGrupo(grupoActual - 1)
                    accion(anteriorPag)
                    break;

                case "siguiente":
                    const siguientePag = paginaInicioDeGrupo(grupoActual + 1)
                    accion(siguientePag)
                    break;

                default:
                    if (elementoPaginacion) {
                        const pagina = elementoPaginacion.dataset?.pagina
                        if (pagina) {
                            const numPag = parseInt(pagina)
                            if (!isNaN(numPag))
                                accion(numPag)
                        }
                    }
                    break;
            }
        }

        //
        // Calcula la primera página del grupo indicado.
        //
        function paginaInicioDeGrupo(grupo) {
            return 1 + (grupo - 1) * opciones.numElementosPaginacion
        }

        //
        // Calcula la última página del grupo indicado.
        //
        function paginaFinDeGrupo(grupo) {
            return grupo * opciones.numElementosPaginacion
        }
    }

    /**
     * Crea la paginación y los elementos de paginación para que el usuario pueda ver una colección
     * de registros de forma paginada, es decir, con un número máximo de registros y la posibilidad
     * de cambiar de página.
     *
     * @param {PaginationOptions} opciones - Opciones que determinan cómo funcionará la paginación.
     * @param {function} accion - Función a ejecutar cuando el usuario hace clic en la paginación
     *                            para cargar la página indicada.
     *                            Puede recibir como parámetro el número de página al que cambiar.
     */
    static crear(opciones, accion) {
        return new Pagination(opciones, accion)
    }
}
