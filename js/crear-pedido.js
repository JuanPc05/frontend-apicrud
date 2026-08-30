(function () {
    let clienteClient = document.querySelector("#id_cliente");
    let metodoPagoSelect = document.querySelector("#metodo_pago");
    let formularioPedido = document.querySelector("#formulario-pedido");

    document.addEventListener("DOMContentLoaded", () => {
        cargarClientes();
        cargarProductosYCarrito();
    });

    async function cargarClientes() {
        try {
            let url = "http://localhost:3000/api/clientes";
            let data = await fetch(url);
            if (!data.ok) throw new Error(`Error del servidor: ${data.status}`);

            let clientes = await data.json();
            clienteClient.innerHTML = `<option selected disabled>Seleccionar Cliente</option>`;

            clientes.forEach((client) => {
                let option = document.createElement("option");
                option.value = client.id_cliente;
                option.textContent = `${client.nombre} ${client.apellido}`;
                clienteClient.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    }

    async function cargarProductosYCarrito() {
        try {
            let url = "http://localhost:3000/api/productos";
            let data = await fetch(url);
            if (!data.ok) throw new Error(`Error del servidor: ${data.status}`);

            // Normalizamos el id venga como "id" o como "id_producto".
            let productos = (await data.json()).map((p) => ({ ...p, id: p.id ?? p.id_producto }));
            let selectProductos = document.querySelector("#select-productos");

            if (selectProductos) {
                selectProductos.innerHTML = `<option selected disabled>Seleccionar Producto</option>`;
                productos.forEach((prod) => {
                    let option = document.createElement("option");
                    option.value = prod.id;
                    option.textContent = `${prod.nombre} - $${prod.precio}`;
                    selectProductos.appendChild(option);
                });
            }

            if (typeof inicializarCarrito === "function") {
                inicializarCarrito(productos);
            }

        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }

    // Escuchamos el "submit" del formulario (no el "click" del botón) para que
    // también funcione al pulsar Enter y no se recargue la página.
    formularioPedido.addEventListener("submit", (e) => {
        e.preventDefault();
        let pedido = validForm();
        if (pedido) {
            enviarPedidoBackend(pedido);
        }
    });

    function validForm() {
        let ped;
        if (clienteClient.value && clienteClient.value !== "Seleccionar Cliente" && metodoPagoSelect.value && metodoPagoSelect.value !== "Seleccionar Método de Pago") {

            let datosCarrito = obtenerDatosCarrito();

            if (datosCarrito.productos.length === 0) {
                alert("Debe agregar al menos un producto al pedido");
                return;
            }

            ped = {
                id_cliente: parseInt(clienteClient.value, 10),
                metodo_pago: metodoPagoSelect.value,
                descuento: datosCarrito.descuento,
                aumento: datosCarrito.aumento,
                productos: datosCarrito.productos
            };
        } else {
            alert("Faltan campos obligatorios (Cliente o Método de Pago)");
        }
        return ped;
    }

    async function enviarPedidoBackend(datosPedido) {
        try {
            let url = "http://localhost:3000/api/pedidos";
            let respuesta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosPedido)
            });

            if (!respuesta.ok) throw new Error(`Error en el servidor: ${respuesta.status}`);

            await respuesta.json();
            alert("¡Pedido creado correctamente!");
            window.location.href = "listado-pedidos.html";
        } catch (error) {
            console.error("Error al registrar el pedido:", error);
            alert("Hubo un problema al guardar el pedido en la base de datos.");
        }
    }
})();
