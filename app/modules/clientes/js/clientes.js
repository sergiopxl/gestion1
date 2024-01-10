"use strict"

console.log("clientes.js v1.0")

function doClientes() {

    const contenedorListado = document.querySelector("main")
    const templateCliente = document.querySelector(".cliente-row")

    function getClientes() {

        fetch(apiUrlClientesGet, { method: "GET" }).then(respuesta => {
            respuesta.json().then(clientes => {
                printListaClientes(clientes)
            })
        })
    }

    function printListaClientes(clientes) {
        clientes.forEach(cliente => {
            const clienteContenedor = templateCliente.cloneNode(true)

            clienteContenedor.querySelector(".cliente-datos-nombre").textContent = cliente.nombre;
            clienteContenedor.querySelector(".cliente-datos-cif").textContent = cliente.cif;
            clienteContenedor.querySelector(".cliente-datos-tlf").textContent = cliente.telefono;
            clienteContenedor.querySelector(".cliente-datos-direccion").textContent = cliente.direccion;

            contenedorListado.append(clienteContenedor)
        });
    }

    getClientes()
}

doClientes()