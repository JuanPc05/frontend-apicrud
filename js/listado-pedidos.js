let tablaPedido = document.querySelector("#tabla-pedidos tbody");

document.addEventListener("DOMContentLoaded", () => {
    getPedidosConTotalReal();
});

async function getPedidosConTotalReal() {
    try {
        // 1. Obtenemos los pedidos generales
        let resPedidos = await fetch("http://localhost:3000/api/pedidos", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!resPedidos.ok) throw new Error(`Error al cargar pedidos: ${resPedidos.status}`);
        let pedidos = await resPedidos.json();

        // 2. Obtenemos los detalles de los productos (tabla detalle_pedido)
        let detalles = [];
        try {
            let resDetalle = await fetch("http://localhost:3000/api/detalle-pedidos", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (resDetalle.ok) {
                detalles = await resDetalle.json();
            }
        } catch (e) {
            console.log("No se pudo cargar el detalle de pedidos de forma independiente.");
        }

        if (!pedidos || pedidos.length === 0) {
            console.log("La tabla de pedidos está vacía.");
            return;
        }

        tablaPedido.innerHTML = "";

        pedidos.forEach((pedido, index) => {
            let pedidoId = pedido.id || pedido.id_pedido;

            // Filtramos los productos de la tabla detalle_pedido que corresponden a este pedido
            let productosDelPedido = detalles.filter(d => d.id_pedido == pedidoId);

            // Calculamos el subtotal real sumando (precio * cantidad) de cada producto
            let subtotalProductos = productosDelPedido.reduce((acc, item) => {
                return acc + (parseFloat(item.precio) * parseInt(item.cantidad));
            }, 0);

            let aumento = parseFloat(pedido.aumento) || 0;
            let descuento = parseFloat(pedido.descuento) || 0; // Si el descuento se guardó como porcentaje o valor fijo

            // Si el descuento fue porcentaje (ej: guardaste 10 para 10%), lo calculamos sobre el subtotal. 
            // Si tu descuento se guardaba en dinero directo, cambia esta línea por: let valorDescuento = descuento;
            let valorDescuentoDinero = descuento > 0 && descuento <= 100 ? (subtotalProductos * descuento) / 100 : descuento;

            // FÓRMULA FINAL CORRECTA: (Subtotal de productos + Aumento de envío) - Descuento
            let totalReal = (subtotalProductos + aumento) - valorDescuentoDinero;

            // Si por alguna razón no hay productos en el detalle, mostramos al menos el aumento o cero
            let mostrarTotal = subtotalProductos > 0 ? totalReal : aumento;

            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>#${pedidoId || (index + 1)}</td>
                <td>${pedido.nombre} ${pedido.apellido || ''}</td>
                <td>${pedido.email || 'N/A'}</td>
                <td>${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'N/A'}</td>
                <td>$${mostrarTotal.toFixed(2)}</td>
                <td>${pedido.estado || 'Completado'}</td>
                <td>    
                    <button class="btn btn-warning">editar</button>
                    <button class="btn btn-danger">borrar</button>
                </td>
            `;
            tablaPedido.appendChild(fila);
        });

    } catch (error) {
        console.log("Error al procesar el listado de pedidos:", error);
    }
}