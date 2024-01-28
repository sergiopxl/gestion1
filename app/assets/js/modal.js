"use strict"

console.log("modal.js 1.2")

/**
 * Representa un cuadro de diálogo modal para pedir confirmación del usuario, mostrar
 * información o presentar un error.
 */
class Modal {

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
        }

        this.contendor.append(this.contenido, this.botonera)
        this.fondo.append(this.contendor)
        document.querySelector("body").classList.add("noscroll")
        document.querySelector("body").append(this.fondo)
    }

    /**
     * Oculta y destruye el diálogo modal.
     */
    destroy() {
        this.fondo.remove()
        document.querySelector("body").classList.remove("noscroll")
    }
}
