let tablaPro = document.querySelector("#tabla-productos tbody");


document.addEventListener("DOMContentLoaded", () => {
    getProducts();
});

async function getProducts() {
    try {
        let url = "http://localhost:3000/api/productos";
        let data = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json" 
            }
        });


        if (!data.ok) {
            throw new Error(`Error del servidor: ${data.status}`);
        }

        let products = await data.json();
        console.log(products);

        tablaPro.innerHTML = "";

        products.forEach((pro, index) => {
            let id = pro.id_producto ?? pro.id;

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
                    <button class="btn btn-warning" onclick="location.href='actualizar-pro.html?id=${id}'">editar</button>
                    <button class="btn btn-danger" onclick="eliminarProducto(${id}, this)">borrar</button>
                </td>
            `;
            tablaPro.appendChild(fila);
        });
    } catch (error) {
        console.log(error);
    }
}