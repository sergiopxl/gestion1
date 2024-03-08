console.log("modal.js 1.6")

/**
 * Define opciones para configurar un `Modal`.
 */
export class ModalOptions {

    /**
     * Clase CSS a aplicar al `Modal`.
     * Si se deja `undefined`, se usará la clase adecuada al tipo de diálogo modal, si éste tiene una.
     */
    class

    /**
     * Indica si se debe mostrar el botón "Aceptar" en el diálogo.
     */
    mostrarBotonAceptar = true
    /**
     * Indica si se debe mostrar el botón "Cancelar" en el diálogo.
     * NOTA: Si no se muestra el botón "Cancelar", debe existir otra forma de cerrar el
     * diálogo o no se podrá salir de él.
     */
    mostrarBotonCancelar = true

    /**
     * Contenido HTML para el botón "Aceptar". Por defecto será el texto `Aceptar`.
     */
    botonAceptarContent = ModalOptions.defaultBotonAceptarContent
    /**
     * Contenido HTML para el botón "Cancelar". Por defecto será el texto `Cancelar`.
     */
    botonCancelarContent = ModalOptions.defaultBotonCancelarContent


    /**
     * Contenido HTML por defecto para el botón "Aceptar".
     */
    static defaultBotonAceptarContent = "Aceptar"
    /**
     * Contenido HTML por defecto para el botón "Cancelar".
     */
    static defaultBotonCancelarContent = "Cancelar"
}

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
     * @param {ModalOptions?} opciones - Opciones para configurar el diálogo.
     */
    constructor(contenido, accion, params, opciones) {

        this.fondo.classList.add("modal-fondo")

        this.contendor.classList.add("modal-contenedor")
        this.contenido.classList.add("modal-contenido")

        // Si no se especifican opciones, usamos las opciones por defecto
        opciones ??= new ModalOptions()

        // Contenido: Directamente el contenido HTML indicado
        if (typeof(contenido) === "string")
            this.contenido.innerHTML = contenido

        // Contenido: Directamente el elemento de DOM indicado
        else if (contenido instanceof HTMLElement)
            this.contenido.append(contenido)

        else throw new Error(`Modal: El contenido no es ni HTML ni elementos del DOM`)

        this.botonAceptar.classList.add("btn-aceptar")
        this.botonAceptar.innerHTML = opciones.botonAceptarContent ?? ModalOptions.defaultBotonAceptarContent
        this.botonCancelar.classList.add("btn-cancelar")
        this.botonCancelar.innerHTML = opciones.botonCancelarContent ?? ModalOptions.defaultBotonCancelarContent

        // Por defecto, ambos botones destruyen el diálogo y
        // Aceptar ejecuta la acción si se ha especificado
        if (opciones.mostrarBotonAceptar)
            this.botonera.append(this.botonAceptar)
        this.botonAceptar.addEventListener("click", e => {
            e.preventDefault()

            if (accion)
                accion(params)

            this.cerrar()
        })
        // Sólo mostramos el 2º botón si "Aceptar" debe ejecutar una acción distinta a "Cancelar"
        if (accion && opciones.mostrarBotonCancelar)
            this.botonera.append(this.botonCancelar)
        this.botonCancelar.addEventListener("click", e => {
            e.preventDefault()
            this.cerrar()
        })

        this.contendor.append(this.contenido, this.botonera)
        this.fondo.append(this.contendor)

        // Establecemos la clase CSS si se ha especificado
        if (opciones.class)
            this.contendor.classList.add(opciones.class)
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
     * @param {ModalOptions?} opciones - Opciones para configurar el diálogo.
     */
    constructor(texto, opciones) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)

        super(`<p>${texto}</p>`, null, null, opciones)

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
     * @param {ModalOptions?} opciones - Opciones para configurar el diálogo.
     */
    constructor(texto, accion, params, opciones) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)
        if (accion === undefined)
            throw new Error(`Modal: Se requiere accion`)

        super(`<p>${texto}</p>`, accion, params, opciones)

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
    static mostrar(texto, accion, params) {
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
     * @param {ModalOptions?} opciones - Opciones para configurar el diálogo.
     */
    constructor(texto, opciones) {

        if (typeof(texto) !== "string")
            throw new Error(`Modal: El contenido debe ser texto`)

        super(`<p>${texto}</p>`, null, null, opciones)

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
