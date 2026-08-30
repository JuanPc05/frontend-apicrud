(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get("id");

    let clienteSelect = document.querySelector("#id_cliente");
    let metodoPagoSelect = document.querySelector("#metodo_pago");
    let selectProductos = document.querySelector("#select-productos");
    let btnAgregar = document.querySelector("#btn-agregar-producto");
    let tablaCarrito = document.querySelector("#tabla-carrito tbody");
    let descuentoInput = document.querySelector("#descuento");
    let aumentoInput = document.querySelector("#aumento");
    let totalPantalla = document.querySelector("#total-pedido");
    let formulario = document.querySelector("#formulario-editar-pedido");

    let carrito = [];
    let listaProductosGlobal = [];

    // Escape para evitar inyección de HTML al pintar datos con innerHTML.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    // Normaliza el id del producto venga como venga del backend.
    const idProd = (p) => p.id ?? p.id_producto;

    document.addEventListener("DOMContentLoaded", async () => {
        if (!pedidoId) {
            alert("ID de pedido no válido.");
            window.location.href = "listado-pedidos.html";
            return;
        }

        await cargarClientes();
        await cargarProductosDisponibles();
        await cargarDatosPedido();

        configurarEventos();
    });

    async function cargarClientes() {
        try {
            let res = await fetch("http://localhost:3000/api/clientes");
            let clientes = await res.json();
            clienteSelect.innerHTML = `<option selected disabled>Seleccionar Cliente</option>`;
            clientes.forEach((c) => {
                let opt = document.createElement("option");
                opt.value = c.id_cliente;
                opt.textContent = `${c.nombre} ${c.apellido}`;
                clienteSelect.appendChild(opt);
            });
        } catch (e) { console.error("Error clientes:", e); }
    }

    async function cargarProductosDisponibles() {
        try {
            let res = await fetch("http://localhost:3000/api/productos");
            listaProductosGlobal = (await res.json()).map((p) => ({ ...p, id: p.id ?? p.id_producto }));
            selectProductos.innerHTML = `<option selected disabled>Seleccionar Producto</option>`;
            listaProductosGlobal.forEach((p) => {
                let opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = `${p.nombre} - $${p.precio}`;
                selectProductos.appendChild(opt);
            });
        } catch (e) { console.error("Error productos:", e); }
    }

    async function cargarDatosPedido() {
        try {
            let res = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`);
            let pedido = await res.json();

            clienteSelect.value = pedido.id_cliente;
            metodoPagoSelect.value = pedido.metodo_pago;
            aumentoInput.value = pedido.aumento || 0;

            let detalles = pedido.detalles || [];
            let subtotalOriginal = detalles.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
            if (subtotalOriginal > 0 && pedido.descuento > 0) {
                let porcentajeReal = (pedido.descuento * 100) / subtotalOriginal;
                descuentoInput.value = Math.round(porcentajeReal);
            } else {
                descuentoInput.value = 0;
            }

            carrito = detalles.map((d) => ({
                id_producto: d.id_producto,
                nombre: d.producto_nombre,
                precio: parseFloat(d.precio),
                cantidad: d.cantidad
            }));

            renderizarTablaCarrito();
            calcularTotales();
        } catch (e) {
            console.error("Error cargando pedido:", e);
            alert("No se pudo cargar el pedido para editar.");
        }
    }

    function configurarEventos() {
        btnAgregar.addEventListener("click", () => {
            let id = parseInt(selectProductos.value, 10);
            if (!id) {
                alert("Selecciona un producto.");
                return;
            }
            let prodEncontrado = listaProductosGlobal.find((p) => idProd(p) === id);
            if (!prodEncontrado) return;

            let existe = carrito.find((item) => item.id_producto === id);
            if (existe) {
                existe.cantidad += 1;
            } else {
                carrito.push({
                    id_producto: id,
                    nombre: prodEncontrado.nombre,
                    precio: parseFloat(prodEncontrado.precio),
                    cantidad: 1
                });
            }
            renderizarTablaCarrito();
            calcularTotales();
        });

        [descuentoInput, aumentoInput].forEach((inp) => {
            if (inp) inp.addEventListener("input", calcularTotales);
        });

        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (carrito.length === 0) {
                alert("El pedido debe tener al menos un producto.");
                return;
            }

            let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
            let porcentaje = parseFloat(descuentoInput.value) || 0;
            let descuentoDinero = (subtotalGeneral * porcentaje) / 100;
            let aumentoDinero = parseFloat(aumentoInput.value) || 0;

            let pedidoActualizado = {
                id_cliente: parseInt(clienteSelect.value, 10),
                metodo_pago: metodoPagoSelect.value,
                descuento: descuentoDinero,
                aumento: aumentoDinero,
                productos: carrito.map((item) => ({
                    id_producto: item.id_producto,
                    precio: item.precio,
                    cantidad: item.cantidad
                }))
            };

            try {
                let res = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pedidoActualizado)
                });

                if (res.ok) {
                    alert("¡Pedido actualizado con éxito!");
                    window.location.href = "listado-pedidos.html";
                } else {
                    alert("Error al actualizar el pedido.");
                }
            } catch (e) {
                console.error("Error de red:", e);
            }
        });
    }

    function renderizarTablaCarrito() {
        tablaCarrito.innerHTML = "";
        carrito.forEach((item, index) => {
            let subtotal = item.precio * item.cantidad;
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${esc(item.nombre)}</td>
                <td>$${item.precio.toLocaleString("es-CO")}</td>
                <td><input type="number" value="${item.cantidad}" min="1" class="form-control" style="width: 80px;" onchange="actualizarCantidad(${index}, this.value)"></td>
                <td>$${subtotal.toLocaleString("es-CO")}</td>
                <td><button type="button" class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">X</button></td>
            `;
            tablaCarrito.appendChild(fila);
        });
    }

    window.actualizarCantidad = function (index, val) {
        let cant = parseInt(val, 10);
        carrito[index].cantidad = cant > 0 ? cant : 1;
        renderizarTablaCarrito();
        calcularTotales();
    };

    window.eliminarProducto = function (index) {
        carrito.splice(index, 1);
        renderizarTablaCarrito();
        calcularTotales();
    };

    function calcularTotales() {
        let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        let porcentaje = parseFloat(descuentoInput.value) || 0;
        let descuentoDinero = (subtotalGeneral * porcentaje) / 100;
        let aumentoDinero = parseFloat(aumentoInput.value) || 0;

        let totalFinal = (subtotalGeneral + aumentoDinero) - descuentoDinero;
        if (totalFinal < 0) totalFinal = 0;

        if (totalPantalla) {
            totalPantalla.textContent = `$${Math.round(totalFinal).toLocaleString("es-CO")}`;
        }
    }
})();
