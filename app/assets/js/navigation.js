"use strict"

console.log("navigation.js 1.1");

function doNavigation(){
  const apartados = [
    {
      literal : "inicio",
      url : "../../modules/inicio/index.html"
    },
    {
      literal : "clientes",
      url : "../../modules/clientes/index.html"
    },
    {
      literal : "facturas",
      url : "../../modules/facturas/index.html"
    },
    {
      literal : "comunicaciones",
      url : "../../modules/comunicaciones/index.html"
    },
    {
      literal : "informes",
      url : "../../modules/informes/index.html"
    },
  ];
  const navegacionContenedor = document.querySelector("#navegacion-principal ul");

  apartados.forEach(apartado=>{
    const navegacionLi = document.createElement("li");
    const navegacionA = document.createElement("a");
    navegacionA.textContent = apartado.literal;
    navegacionA.href = apartado.url;
    navegacionLi.append(navegacionA);
    navegacionContenedor.append(navegacionLi);
  });

}

doNavigation();