// variables globales
// Referenciamos directamente el <tbody>, no la tabla completa,
// porque las filas <tr> deben insertarse ahí, no como hijas de <table>
let tablaPro = document.querySelector("#tabla-productos tbody");

// DOMContentLoaded: se dispara cuando el HTML ya está parseado
// (sin esperar imágenes/CSS). Acá es donde disparamos la carga inicial de datos.
document.addEventListener("DOMContentLoaded", () => {
    getProducts();
});

// funcion para realizar la peticion HTTP a la BD
async function getProducts() {
    try {
        let url = "http://localhost:3000/api/productos";
        let data = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json" // corregido: estaba invertido
            }
        });

        // Chequeo de status HTTP antes de parsear.
        // fetch() NO lanza error automáticamente en 404/500, solo si falla la red.
        if (!data.ok) {
            throw new Error(`Error del servidor: ${data.status}`);
        }

        let products = await data.json();
        console.log(products);

        // Limpiamos la tabla antes de repintar (evita duplicar filas
        // si getProducts() se llama más de una vez, ej. tras crear un producto)
        tablaPro.innerHTML = "";

        products.forEach((pro, index) => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${pro.nombre}</td>
                <td>${pro.descripcion}</td>
                <td>${pro.precio}</td>
                <td>${pro.stock}</td>
                <td>
                    <img src="${pro.imagen}" width="100px">
                </td>
                <td>
                    <button class="btn btn-warning">editar</button>
                    <button class="btn btn-danger">borrar</button>
                </td>
            `;
            tablaPro.appendChild(fila);
        });
    } catch (error) {
        console.log(error);
    }
}