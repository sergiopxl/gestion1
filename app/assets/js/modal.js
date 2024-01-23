"use strict"

console.log("modal.js 1.1")

// Modal CONFIRMACION / INFORMACIÓN.
//   Se usa por ejemplo para confirmar operaciones de tipo alta, borrado y modificación de datos.
//   Admite la ejecución de funciones callback
//
// @params 
//   texto  : string 
//   tipo   : string      // Valores : "confirmacion", "informacion"
//   accion : function()  // Función que se ejecuta al aceptar una operación
//   params : Any         // Parametros para ejecutar la función guardada en el parámetro accion

class Modal {

    fondo = document.createElement("div")
    contendor = document.createElement("div")
    contenido = document.createElement("div")
    titularContenedor = document.createElement("div")
    botonera = document.createElement("div")
    botonAceptar = document.createElement("button")
    botonCancelar = document.createElement("button")

    constructor(texto, tipo, accion, params) {

        this.fondo.classList.add("modal-fondo")
        this.contendor.classList.add("modal-contenedor")
        this.contenido.classList.add("modal-contenido")
        this.contenido.innerHTML = `<p>${texto}</p>`
        this.titularContenedor.classList.add("modal-titular")

        this.botonera.classList.add("botonera-modal")
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
            this.botonera.append(this.botonAceptar, this.botonCancelar)

        } else if (tipo === "informacion") {

            this.botonera.append(this.botonAceptar)
            this.botonAceptar.addEventListener("click", e => {
                e.preventDefault()
                this.destroy()
            })
        }

        this.contendor.append(this.titularContenedor, this.contenido, this.botonera)
        this.fondo.append(this.contendor)
        document.querySelector("body").classList.add("noscroll")
        document.querySelector("body").append(this.fondo)
    }

    destroy() {
        this.fondo.remove()
        document.querySelector("body").classList.remove("noscroll")
    }
}
