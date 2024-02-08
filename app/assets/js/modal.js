console.log("modal.js 1.5")

/**
 * Representa un cuadro de diálogo modal con contenido personalizado.
 */
export class Modal {

    fondo = document.createElement("div")

    contendor = document.createElement("div")
    contenido = document.createElement("div")

    botonera = document.createElement("div")
    botonAceptar = document.createElement("button")
    botonCancelar = document.createElement("button")

    /**
     * Inicializa y muestra un diálogo modal.
     *
     * @param {string | HTMLElement} contenido - Contenido (texto HTML o un elemento del DOM) a mostrar en el diálogo.
     * @param {function} accion - Una función a ejecutar en caso de que se quiera que el usuario acepte o confirme algo.
     *                            Si se especifica, el diálogo presentará dos botones (Aceptar y Cancelar).
     * @param {object} params - Un objeto con los argumentos a pasar a la  accion.
     */
    constructor(contenido, accion, params) {

        this.fondo.classList.add("modal-fondo")

        this.contendor.classList.add("modal-contenedor")
        this.contenido.classList.add("modal-contenido")

        // Contenido: Directamente el contenido HTML indicado
        if (typeof(contenido) === "string")
            this.contenido.innerHTML = contenido

        // Contenido: Directamente el elemento de DOM indicado
        else if (contenido instanceof HTMLElement)
            this.contenido.append(contenido)

        else throw new Error(`Modal: El contenido no es ni HTML ni elementos del DOM`)

        this.botonAceptar.classList.add("btn-aceptar")
        this.botonAceptar.textContent = "Aceptar"
        this.botonCancelar.classList.add("btn-cancelar")
        this.botonCancelar.textContent = "Cancelar"

        // Por defecto, ambos botones destruyen el diálogo y
        // Aceptar ejecuta la acción si se ha especificado
        this.botonera.append(this.botonAceptar)
        this.botonAceptar.addEventListener("click", e => {
            e.preventDefault()

            if (accion)
                accion(params)

            this.cerrar()
        })
        // Sólo mostramos el 2º botón si "Aceptar" debe ejecutar una acción distinta a "Cancelar"
        if (accion)
            this.botonera.append(this.botonCancelar)
        this.botonCancelar.addEventListener("click", e => {
            e.preventDefault()
            this.cerrar()
        })

        this.contendor.append(this.contenido, this.botonera)
        this.fondo.append(this.contendor)
    }

    //
    // Gestiona el evento de cuando el usuario presiona una tecla en el diálogo.
    //
    handleEvent(evento) {

        if (evento.type !== "keydown")
            return

        // Escape permite salir (equivale a Cancelar)
        if (evento.key === "Escape")
            this.cerrar()

        // Invalidamos tabulador y cambiamos el foco a mano dentro del diálogo
        else if (evento.key == "Tab") {
            evento.preventDefault()

            const botones = this.botonera.querySelectorAll("button")

            if (botones.length > 1) {
                const focusedButton = document.activeElement
                if (focusedButton === this.botonAceptar)
                    this.botonCancelar.focus()
                else if (focusedButton === this.botonCancelar)
                    this.botonAceptar.focus()
            }
        }
    }

    /**
     * Muestra el diálogo modal.
     */
    mostrar() {
        document.body.classList.add("noscroll")
        document.body.append(this.fondo)

        // Gestiona las pulsaciones de teclado para que el foco no pueda escapar del diálogo
        this.contendor.addEventListener("keydown", this)
    }

    /**
     * Oculta y destruye el diálogo modal.
     */
    cerrar() {
        document.body.removeChild(this.fondo)
        document.body.classList.remove("noscroll")
    }
}

/**
 * Representa un cuadro de diálogo modal para mostrar información al usuario.
 */
export class InfoBox extends Modal {

    /**
     * Inicializa y muestra un diálogo modal de información.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     */
    constructor(texto) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)

        super(`<p>${texto}</p>`)

        this.contendor.classList.add("informacion")

        this.botonAceptar.focus()
    }

    /**
     * Muestra un diálogo modal de información.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     */
    static mostrar(texto) {
        new InfoBox(texto).mostrar()
    }
}

/**
 * Representa un cuadro de diálogo modal para pedir confirmación al usuario.
 */
export class ConfirmBox extends Modal {

    /**
     * Inicializa y muestra un diálogo modal de confirmación.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     * @param {function} accion - Una función a ejecutar en caso de que el usuario confirme la acción.
     * @param {object} params - Un objeto con los argumentos a pasar a la accion.
     */
    constructor(texto, accion, params) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)
        if (accion === undefined)
            throw new Error(`Modal: Se requiere accion`)

        super(`<p>${texto}</p>`, accion, params)

        this.contendor.classList.add("confirmacion")

        // En una confirmación, la respuesta por defecto es "Cancelar"
        this.botonCancelar.focus()
    }

    /**
     * Muestra un diálogo modal de confirmación.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     * @param {function} accion - Una función a ejecutar en caso de que el usuario confirme la acción.
     * @param {object} params - Un objeto con los argumentos a pasar a la accion.
     */
    static mostrar(texto) {
        new ConfirmBox(texto, accion, params).mostrar()
    }
}

/**
 * Representa un cuadro de diálogo modal para presentar un error al usuario.
 */
export class ErrorBox extends Modal {

    /**
     * Inicializa y muestra un diálogo modal de error.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     */
    constructor(texto) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)

        super(`<p>${texto}</p>`)

        this.contendor.classList.add("error")

        this.botonAceptar.focus()
    }

    /**
     * Muestra un diálogo modal de error.
     *
     * @param {string} texto - Texto a mostrar en el diálogo.
     */
    static mostrar(texto) {
        new ErrorBox(texto).mostrar()
    }
}
