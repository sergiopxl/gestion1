import { navegacion } from "../../../assets/js/navegacion.js"
import * as modal from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("usuarios.js v1.0")

navegacion("usuarios")

const contenedorPrincipal = document.querySelector("main")

const plantillaFilaUsuario = document.querySelector("#templateUsuarioRow")

const botonNuevoUsuario = document.querySelector(".nuevo-cliente-boton")
botonNuevoUsuario.addEventListener("click", nuevoUsuario)

//
// Llama a la API para leer los usuarios y mostrarlos.
//
async function getUsuarios() {

    let datosUsuarios

    try {
        datosUsuarios = await datos.cargarUsuarios()
    }
    catch (error) {
        modal.ErrorBox.mostrar(`Ha ocurrido un problema:<br>` + error)
        console.error(error)
    }

    imprimirUsuarios(datosUsuarios)
}

//
// Imprime la lista de usuarios.
//
function imprimirUsuarios(datos) {

    contenedorPrincipal.innerHTML = ""

    for (let usuario of datos.usuarios) {

        const fila = plantillaFilaUsuario.cloneNode(true)
        fila.setAttribute("id", "")
        fila.classList.remove("hidden")

        fila.querySelector(".usuario-avatar .usuario-id").textContent = usuario.id
        fila.querySelector(".usuario-avatar img").src = usuario.avatar

        fila.querySelector(".usuario-nombre").textContent = usuario.nombre
        fila.querySelector(".usuario-email").textContent = usuario.email
        fila.querySelector(".usuario-role").textContent = usuario.role

        const botonEditar = fila.querySelector("button.editar-usuario")
        botonEditar.addEventListener("click", e => {
            e.preventDefault()
            editarUsuario(usuario)
        })

        contenedorPrincipal.append(fila)
    }
}

//
// Muestra la interfaz de creación de un nuevo Usuario.
//
function nuevoUsuario() {
}

//
// Muestra la interfaz de edición de un Usuario.
//
function editarUsuario(usuario) {
}

getUsuarios()
