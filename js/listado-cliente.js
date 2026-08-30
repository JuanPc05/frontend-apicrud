(function () {
    let tablaCliente = document.querySelector("#tabla-clientes tbody");

    // Escape para evitar inyección de HTML al pintar datos de la API.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    document.addEventListener("DOMContentLoaded", () => {
        getClients();
    });

    async function getClients() {
        try {
            let clients = await listarClientesApi();
            tablaCliente.innerHTML = "";
            clients.forEach((client) => {
                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${esc(client.id_cliente)}</td>
                    <td>${esc(client.nombre)}</td>
                    <td>${esc(client.apellido)}</td>
                    <td>${esc(client.email)}</td>
                    <td>${esc(client.celular)}</td>
                    <td>${esc(client.direccion)}</td>
                    <td>
                        <button class="btn btn-warning btn-editar">editar</button>
                        <button class="btn btn-danger btn-borrar">borrar</button>
                    </td>
                `;
                tablaCliente.appendChild(fila);
            });
        } catch (error) {
            console.error(error);
            tablaCliente.innerHTML = `<tr><td colspan="7" class="text-center text-danger">
                No se pudieron cargar los clientes. ¿Está corriendo el servidor?</td></tr>`;
        }
    }

    // Comentario: este listener se agrega UNA sola vez, no importa cuántas filas
    // se creen o destruyan después. Es más eficiente en memoria.
    tablaCliente.addEventListener("click", (evento) => {
        if (evento.target.classList.contains("btn-editar")) {
            let fila = evento.target.closest("tr"); // sube al <tr> padre
            let id = fila.querySelector("td").textContent; // primer <td> = id_cliente
            irAEditar(id);
        }

        if (evento.target.classList.contains("btn-borrar")) {
            let fila = evento.target.closest("tr");
            let id = fila.querySelector("td").textContent;
            eliminarCliente(id);
        }
    });

    function irAEditar(id) {
        window.location.href = `crear-cliente.html?id=${id}`;
    }

    async function eliminarCliente(id) {
        let confirmar = confirm("¿Seguro que querés eliminar este cliente?");
        if (!confirmar) return;

        try {
            await eliminarClienteApi(id);
            alert("Cliente eliminado con éxito");
            getClients();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }
})();
