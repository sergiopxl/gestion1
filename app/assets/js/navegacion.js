console.log("navigation.js 1.2")

/**
 * Inicia y configura la barra de navegación con los módulos disponibles.
 * La barra de navegación debe ser un elemento HTML con `id="navegacion-principal"`
 * que contenga un elemento `<ul>`. Éste será donde se inserten los elementos de la
 * barra como `<li>`s.
 */
export function navegacion(apartadoActual) {

    const apartados = [
        {
            literal: "inicio",
            url: "../../modules/inicio/index.html"
        },
        {
            literal: "clientes",
            url: "../../modules/clientes/index.html"
        },
        {
            literal: "facturas",
            url: "../../modules/facturas/index.html"
        },
        {
            literal: "proveedores",
            url: "../../modules/proveedores/index.html"
        },
        {
            literal: "comunicaciones",
            url: "../../modules/comunicaciones/index.html"
        },
        {
            literal: "informes",
            url: "../../modules/informes/index.html"
        }
    ]
    const navegacionContenedor = document.querySelector("#navegacion-principal ul")

    apartados.forEach(apartado => {
        const navegacionLi = document.createElement("li")
        const navegacionA = document.createElement("a")

        navegacionA.textContent = apartado.literal
        navegacionA.href = apartado.url

        if (apartado.literal === apartadoActual) {
            navegacionLi.classList.add("activo")
        }

        navegacionLi.append(navegacionA)
        navegacionContenedor.append(navegacionLi)
    })
}
