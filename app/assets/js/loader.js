"use strict"

console.log("loader.js 1.1")

class Loader {

    container = document.createElement("div")
    content = document.createElement("div")

    constructor() {

        this.container.classList.add("loader-background")

        this.content.classList.add("loader-content")
        this.content.textContent = "Cargando datos..."

        this.container.append(this.content)

        document.querySelector("body").append(this.container)
        document.querySelector("body").classList.add("noscroll")
    }

    destroy() {

        this.container.remove()

        document.querySelector("body").classList.remove("noscroll")
    }
}
