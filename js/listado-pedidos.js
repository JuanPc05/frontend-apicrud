(function () {
    // Escape para evitar inyección de HTML al pintar datos de la API.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    document.addEventListener("DOMContentLoaded", () => {
        getPedidosLimpios();
    });

    async function getPedidosLimpios() {
        let tablaPedido = document.querySelector("#tabla-pedidos");
        try {
            let res = await fetch("http://localhost:3000/api/pedidos");
            if (!res.ok) throw new Error("Error en la red");
            let pedidos = await res.json();

            tablaPedido.innerHTML = "";

            if (!pedidos || pedidos.length === 0) {
                tablaPedido.innerHTML = `<tr><td colspan="7" class="text-center">No hay pedidos registrados</td></tr>`;
                return;
            }

            pedidos.forEach((pedido) => {
                // Limpiamos los ceros decimales y agregamos puntos de miles.
                let total = pedido.total_calculado ?? pedido.total ?? 0;
                let totalLimpio = Math.round(total).toLocaleString("es-CO");

                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>#${esc(pedido.id)}</td>
                    <td>${esc(pedido.nombre)} ${esc(pedido.apellido || '')}</td>
                    <td>${esc(pedido.email || 'N/A')}</td>
                    <td>${pedido.fecha ? esc(new Date(pedido.fecha).toLocaleString()) : 'N/A'}</td>
                    <td>$${totalLimpio}</td>
                    <td>Completado</td>
                    <td>
                        <button type="button" class="btn btn-warning btn-sm" onclick="editarPedido(${pedido.id})">editar</button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="borrarPedido(${pedido.id})">borrar</button>
                    </td>
                `;
                tablaPedido.appendChild(fila);
            });
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
            tablaPedido.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
                No se pudieron cargar los pedidos. ¿Está corriendo el servidor?</td></tr>`;
        }
    }

    // Función global para borrar pedido (Elimina de la BD y actualiza la tabla)
    window.borrarPedido = async function (id) {
        if (confirm(`¿Estás seguro de que deseas eliminar el pedido #${id}?`)) {
            try {
                let res = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    alert("Pedido eliminado con éxito");
                    getPedidosLimpios(); // Recarga la tabla al instante
                } else {
                    alert("No se pudo eliminar el pedido");
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    // Función global para editar pedido
    window.editarPedido = function (id) {
        window.location.href = `editar-pedido.html?id=${id}`;
    };
})();
