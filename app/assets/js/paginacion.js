console.log("paginacion.js 1.1")

/**
 * Crea los elementos de paginación para que el usuario pueda ver una colección de elementos de forma
 * paginada, es decir, con un número máximo de elementos y la posibilidad de cambiar de página.
 * La barra de paginación debe ser un elemento con `id="paginacion"` que contenga un elemento `<ul>`.
 * Dentro de éste se crearán los elementos de paginación como `<li>`s.
 * 
 * @param {number} paginaActual - Número de la página actual a mostrar, siendo 1 la primera página.
 * @param {number} registrosPorPagina - Número de resultados a mostrar por página.
 * @param {number} numRegistros - Número total de registros a mostrar de forma paginada.
 * @param {function} accion - Función a ejecutar cuando el usuario hace clic en la paginación para cargar la página indicada.
 *                            Puede recibir como parámetro el número de página al que cambiar.
 */
export function paginacion(paginaActual, registrosPorPagina, numRegistros, accion) {

    // Representa un <li> clicable para que el usuario pueda cambiar de página
    class ElementoPaginacion {

        textoContenido
        elementoHtml = document.createElement("li")

        constructor(esPaginaActual, texto) {

            this.elementoHtml.classList.add("elemento-paginacion")
            if (esPaginaActual)
                this.elementoHtml.classList.add("elemento-paginacion-activo")

            this.elementoHtml.textContent = this.textoContenido = texto
            this.elementoHtml.addEventListener("click", () => this.ejecutaAccion())
        }

        ejecutaAccion() {
            accion(this.textoContenido)
        }
    }

    const contenedorPaginacion = document.querySelector("#paginacion > ul")
    contenedorPaginacion.innerHTML = ""

    // Crea un ElementoPaginacion por cada página de resultados
    const numPaginas = Math.ceil( numRegistros / registrosPorPagina )
    for (let pag = 1; pag <= numPaginas; pag++) {

        const esPagActiva = (pag == paginaActual)
        const elemento = new ElementoPaginacion(esPagActiva, pag)

        contenedorPaginacion.append(elemento.elementoHtml)
    }
}
