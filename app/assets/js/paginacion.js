"use strict"

console.log("paginacion.js 1.0")

function doPaginacion(paginaActual, registrosPorPagina, numRegistros, accion) {
 
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

    // Crea un elemento por cada página de resultados
    const numPaginas = Math.ceil( numRegistros / registrosPorPagina )
    for (let pag = 1; pag < numPaginas; pag++) {

        const elemento = new ElementoPaginacion(pag == paginaActual, pag)

        contenedorPaginacion.append(elemento.elementoHtml)
    }
}