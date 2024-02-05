console.log("loader.js 2.1")

/**
 * Representa una interfaz de carga que se puede mostrar mientras se lleva a cabo
 * algún otro proceso pesado que puede tardar para que la espera sea más llevadera
 * para el usuario.
 * 
 * @example
 * const loader = new Loader({ milisegundos: 100, mensaje: "Cargando"})
 * loader.destroy()
 */
export class Loader {

    canceled = false;

    container = document.createElement("div")
    content = document.createElement("div")

    /**
     * Crea y muestra una interfaz de carga que ocupa la pantalla mientras algún otro proceso
     * que puede tardar es llevado a cabo. Cuando dicho proceso acabe, puede destruir y ocultar
     * esta interfaz de carga.
     *
     * @param {object} param - Objeto con opciones para la interfaz de carga.
     * @param {number} param.milisegundos - Milisegundos a esperar antes de mostrar el mensaje de carga.
     *                                      Por defecto es 250 milisegundos.
     * @param {string} param.mensaje - El mensaje personalizado a mostrar.
     *                                 Por defecto es `"Cargando datos..."`.
     */
    constructor({milisegundos, mensaje}) {

        const ESPERA_POR_DEFECTO = 250 //ms
        if (!milisegundos)
            milisegundos = ESPERA_POR_DEFECTO

        esperar(milisegundos)
            .then(() => {
                if (!this.canceled) {

                    this.container.classList.add("loader-background")
            
                    this.content.classList.add("loader-content")
                    this.content.textContent = mensaje ?? "Cargando datos..."
            
                    this.container.append(this.content)
            
                    document.querySelector("body").append(this.container)
                    document.querySelector("body").classList.add("noscroll")
                }
                if (this.canceled)
                    this.destroy()
            })

        //
        // Promesa que espera un número de milisegundos.
        //
        function esperar(milisegundos) {

            return new Promise(resolve => {
                setTimeout(resolve, milisegundos)
            })
        }
    }
    
    /**
     * Oculta y destruye la interfaz de carga.
     * Si ésta todavía no se había mostrado, cancela el proceso de mostrarla.
     */
    destroy() {
        this.canceled = true

        this.container.remove()

        document.querySelector("body").classList.remove("noscroll")
    }
}
