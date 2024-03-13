import { navegacion } from "../../../assets/js/navegacion.js"
import * as modal from "../../../assets/js/modal.js"
import * as datos from "./datos.js"

console.log("usuarios.js v1.0")

navegacion("usuarios")

const contenedorPrincipal = document.querySelector("main")
const tituloPrincipal = document.querySelector("#h1-apartado")

const plantillaFilaUsuario = document.querySelector("#templateUsuarioRow")
const plantillaFormUsuario = document.querySelector("#templateUsuarioForm")

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
    tituloPrincipal.textContent = "Usuarios"

    for (let usuario of datos.usuarios) {

        const fila = plantillaFilaUsuario.cloneNode(true)
        fila.setAttribute("id", "")
        fila.classList.remove("hidden")

        fila.querySelector(".usuario-avatar .usuario-id").textContent = usuario.id
        fila.querySelector(".usuario-avatar img").src = usuario.avatar && usuario.avatar !== ""
            ? usuario.avatar
            : "../../assets/avatares/unknown.png"

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

    contenedorPrincipal.innerHTML = ""
    tituloPrincipal.textContent = "Nuevo usuario"

    const formNuevoUsuario = plantillaFormUsuario.cloneNode(true)
    formNuevoUsuario.setAttribute("id", "")
    formNuevoUsuario.classList.remove("hidden")

    const campoPassword = formNuevoUsuario.querySelector('[name = "usuario-password"]')
    const campoPassword2 = formNuevoUsuario.querySelector('[name = "usuario-password2"]')
    const campoAvatar = formNuevoUsuario.querySelector('[name = "usuario-avatar"]')

    configurarCampoPassword(campoPassword)
    configurarCampoPassword(campoPassword2)

    const botonGuardar = formNuevoUsuario.querySelector(".boton-guardar-usuario")
    botonGuardar.addEventListener("click", e => {
        e.preventDefault()
        guardarNuevoUsuario()
    })

    contenedorPrincipal.append(formNuevoUsuario)

    //
    // Guarda el nuevo Usuario.
    //
    async function guardarNuevoUsuario() {

        const datosForm = new FormData(formNuevoUsuario)
        const archivo = campoAvatar.files[0]

        datosForm.append("archivo", archivo)

        try {
            await datos.crearNuevoUsuario(datosForm)

            modal.InfoBox.mostrar("El usuario ha sido creado correctamente.")
        }
        catch (error) {
            modal.ErrorBox.mostrar(`Ha ocurrido un problema:<br>` + error)
            console.error(error)
        }
    }
}

//
// Muestra la interfaz de edición de un Usuario.
//
function editarUsuario(usuario) {
    contenedorPrincipal.innerHTML = ""
    tituloPrincipal.textContent = "Editar usuario"

    const formEditarUsuario = plantillaFormUsuario.cloneNode(true)
    formEditarUsuario.setAttribute("id", "")
    formEditarUsuario.classList.remove("hidden")

    const campoId = formEditarUsuario.querySelector('[name = "usuario-id"]')
    const campoNombre = formEditarUsuario.querySelector('[name = "usuario-nombre"]')
    const campoEmail = formEditarUsuario.querySelector('[name = "usuario-email"]')
    const campoPassword = formEditarUsuario.querySelector('[name = "usuario-password"]')
    const campoPassword2 = formEditarUsuario.querySelector('[name = "usuario-password2"]')
    const campoAvatar = formEditarUsuario.querySelector('[name = "usuario-avatar"]')
    const imgAvatar = formEditarUsuario.querySelector('.usuario-avatar-previo')

    campoId.value = usuario.id
    campoNombre.value = usuario.nombre
    campoEmail.value = usuario.email
    campoPassword.value = ""
    campoPassword2.value = ""

    imgAvatar.classList.remove("hidden")
    imgAvatar.src = usuario.avatar && usuario.avatar !== ""
        ? usuario.avatar
        : "../../assets/avatares/unknown.png"

    configurarCampoPassword(campoPassword)
    configurarCampoPassword(campoPassword2)

    const botonGuardar = formEditarUsuario.querySelector(".boton-guardar-usuario")
    botonGuardar.addEventListener("click", e => {
        e.preventDefault()
        actualizarUsuario()
    })

    contenedorPrincipal.append(formEditarUsuario)

    //
    // Actualiza los datos del Usuario.
    //
    async function actualizarUsuario() {
    }
}

//
// Configura un campo de contraseña haciendo que sus botones de ocultar / mostrar contraseña
// funcionen.
//
function configurarCampoPassword(campoPassword) {

    const fieldset = campoPassword.closest("fieldset")

    const botonMostrarPassword = fieldset.querySelector(".ver-password")
    const botonOcultarPassword = fieldset.querySelector(".ocultar-password")

    botonMostrarPassword.addEventListener("click", e => {
        e.preventDefault()
        campoPassword.setAttribute("type", "text")
        botonMostrarPassword.classList.add("hidden")
        botonOcultarPassword.classList.remove("hidden")
    })
    botonOcultarPassword.addEventListener("click", e => {
        e.preventDefault()
        campoPassword.setAttribute("type", "password")
        botonOcultarPassword.classList.add("hidden")
        botonMostrarPassword.classList.remove("hidden")
    })
}

getUsuarios()
