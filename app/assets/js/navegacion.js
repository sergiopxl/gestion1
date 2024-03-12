console.log("navigation.js 1.3")

/**
 * Inicia y configura la barra de navegación con los módulos disponibles.
 * La barra de navegación debe ser un elemento HTML con `id="navegacion-principal"`
 * que contenga un elemento `<ul>`. Éste será donde se inserten los elementos de la
 * barra como `<li>`s.
 */
export function navegacion(apartadoActual) {

    const apartados = [
        {
            nombre: "inicio",
            icono: "fa-home",
            url: "../../modules/inicio/index.html"
        },
        {
            nombre: "clientes",
            icono: "fa-user-tie",
            url: "../../modules/clientes/index.html"
        },
        {
            nombre: "facturas",
            icono: "fa-file-invoice-dollar",
            url: "../../modules/facturas/index.html"
        },
        {
            nombre: "proveedores",
            icono: "fa-building",
            url: "../../modules/proveedores/index.html"
        },
        {
            nombre: "gastos",
            icono: "fa-dollar-sign",
            url: "../../modules/gastos/index.html"
        },
        {
            nombre: "comunicaciones",
            icono: "fa-phone",
            url: "../../modules/comunicaciones/index.html"
        },
        {
            nombre: "informes",
            icono: "fa-chart-line",
            url: "../../modules/informes/index.html"
        },
        {
            nombre: "usuarios",
            icono: "fa-users",
            url: "../../modules/usuarios/index.html"
        }
    ]
    const navegacionContenedor = document.querySelector("#navegacion-principal ul")

    apartados.forEach(apartado => {
        const navegacionLi = document.createElement("li")
        const navegacionA = document.createElement("a")

        let contenido = apartado.nombre

        if (apartado.icono && apartado.icono !== "") {
            contenido = `<i class="fas ${apartado.icono}"></i> ${contenido}`
        }

        navegacionA.innerHTML = contenido
        navegacionA.href = apartado.url

        if (apartado.nombre === apartadoActual) {
            navegacionLi.classList.add("activo")
        }

        navegacionLi.append(navegacionA)
        navegacionContenedor.append(navegacionLi)
    })
}
