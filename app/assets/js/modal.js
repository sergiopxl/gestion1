console.log("modal.js 1.3")

/**
 * Representa un cuadro de diálogo modal para pedir confirmación del usuario, mostrar
 * información o presentar un error.
 */
export class Modal {

    tipo;

    fondo = document.createElement("div")

    contendor = document.createElement("div")
    contenido = document.createElement("div")
    
    botonera = document.createElement("div")
    botonAceptar = document.createElement("button")
    botonCancelar = document.createElement("button")

    /**
     * Inicializa y muestra un diálogo modal.
     * 
     * @param {string} texto - Texto a mostrar en el diálogo.
     * @param {('informacion' | 'confirmacion' | 'error')} tipo - Indica el tipo de diálogo a mostrar. Puede ser `"confirmacion"`, `"informacion"` o `"error"`.
     * @param {function} accion - Una función a ejecutar en caso de que el usuario confirme la acción (sólo en caso de que el tipo sea `"confirmacion"`).
     * @param {object} params - Un objeto con los argumentos a pasar a la  accion. 
     */
    constructor(texto, tipo, accion, params) {

        this.fondo.classList.add("modal-fondo")

        this.contendor.classList.add("modal-contenedor")
        this.contenido.classList.add("modal-contenido")
        this.contenido.innerHTML = `<p>${texto}</p>`

        this.botonAceptar.classList.add("btn-aceptar")
        this.botonAceptar.textContent = "Aceptar"
        this.botonCancelar.classList.add("btn-cancelar")
        this.botonCancelar.textContent = "Cancelar"

        if (tipo === "confirmacion") {
            this.botonAceptar.addEventListener("click", e => {
                e.preventDefault()
                accion(params)
                this.destroy()
            })
            this.botonCancelar.addEventListener("click", e => {
                e.preventDefault()
                this.destroy()
            })
            this.contendor.classList.add("confirmacion")
            this.botonera.append(this.botonAceptar, this.botonCancelar)

        } else if (tipo === "informacion") {

            this.botonera.append(this.botonAceptar)
            this.botonAceptar.addEventListener("click", e => {
                e.preventDefault()
                this.destroy()
            })
            this.contendor.classList.add("informacion")

        } else if (tipo === "error") {

            this.botonera.append(this.botonAceptar)
            this.botonAceptar.addEventListener("click", e => {
                e.preventDefault()
                this.destroy()
            })
            this.contendor.classList.add("error")

        } else {
            throw new Error(`Modal: Tipo no soportado ${tipo}`)
        }

        this.tipo = tipo
        
        this.contendor.append(this.contenido, this.botonera)
        this.fondo.append(this.contendor)
        document.querySelector("body").classList.add("noscroll")
        document.querySelector("body").append(this.fondo)
        
        // Gestiona las pulsaciones de teclado para que el foco no pueda escapar del diálogo
        this.contendor.addEventListener("keydown", this)
        
        // En una confirmación, la respuesta por defecto es "Cancelar"
        if (tipo === "confirmacion")
            this.botonCancelar.focus()
        else
            this.botonAceptar.focus()
    }

    //
    // Gestiona el evento de cuando el usuario presiona una tecla en el diálogo.
    //
    handleEvent(evento) {

        if (evento.type !== "keydown")
            return

        // Escape permite salir (equivale a Cancelar)
        if (evento.key === "Escape")
            this.destroy()

        // Invalidamos tabulador y cambiamos el foco a mano dentro del diálogo
        else if (evento.key == "Tab") {
            evento.preventDefault()

            if (this.tipo === "confirmacion") {
                const focusedButton = document.activeElement
                if (focusedButton === this.botonAceptar)
                    this.botonCancelar.focus()
                else if (focusedButton === this.botonCancelar)
                    this.botonAceptar.focus()
            }
        }
    }

    /**
     * Oculta y destruye el diálogo modal.
     */
    destroy() {
        this.fondo.remove()
        document.querySelector("body").classList.remove("noscroll")
    }
}
