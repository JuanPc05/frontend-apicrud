(function () {
    let tablaPro = document.querySelector("#tabla-productos tbody");

    // Escape para evitar inyección de HTML al pintar datos de la API.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

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

            tablaPro.innerHTML = "";

            products.forEach((pro, index) => {
                let id = pro.id_producto ?? pro.id;

                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${esc(pro.nombre)}</td>
                    <td>${esc(pro.descripcion)}</td>
                    <td>${esc(pro.precio)}</td>
                    <td>${esc(pro.stock)}</td>
                    <td>
                        <img src="${esc(pro.imagen)}" width="100px">
                    </td>
                    <td>
                        <button class="btn btn-warning" onclick="location.href='actualizar-pro.html?id=${id}'">editar</button>
                        <button class="btn btn-danger" onclick="eliminarProducto(${id}, this)">borrar</button>
                    </td>
                `;
                tablaPro.appendChild(fila);
            });
        } catch (error) {
            console.error(error);
            tablaPro.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
                No se pudieron cargar los productos. ¿Está corriendo el servidor?</td></tr>`;
        }
    }
})();
