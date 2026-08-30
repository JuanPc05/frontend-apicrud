(function () {
    let carrito = [];
    // Guardamos el array real de productos que nos pasa crear-pedido.js en vez
    // de reconstruir nombre/precio parseando el texto del <option>.
    let productosCache = [];

    // Escape para evitar inyección de HTML al pintar datos con innerHTML.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    // Normaliza el id del producto venga como venga del backend.
    const idProd = (p) => p.id ?? p.id_producto;

    const btnAgregar = document.querySelector("#btn-agregar-producto");
    const selectProducto = document.querySelector("#select-productos");
    const tablaCarrito = document.querySelector("#tabla-carrito tbody");
    const descuentoInput = document.querySelector("#descuento");
    const aumentoInput = document.querySelector("#aumento");
    const totalPantalla = document.querySelector("#total-pedido");

    // Función que recibe los productos desde crear-pedido.js
    window.inicializarCarrito = function (productosDisponibles) {
        productosCache = Array.isArray(productosDisponibles) ? productosDisponibles : [];

        if (btnAgregar) {
            // Evitamos duplicar eventos limpiando el clon o usando una bandera
            btnAgregar.replaceWith(btnAgregar.cloneNode(true));
            const btnAgregarNuevo = document.querySelector("#btn-agregar-producto");

            btnAgregarNuevo.addEventListener("click", (e) => {
                e.preventDefault();

                const id = parseInt(selectProducto.value, 10);
                const producto = productosCache.find((p) => idProd(p) === id);

                if (!producto) {
                    alert("Por favor selecciona un producto válido.");
                    return;
                }

                const existe = carrito.find((item) => item.id_producto === id);
                if (existe) {
                    existe.cantidad += 1;
                } else {
                    carrito.push({
                        id_producto: id,
                        nombre: producto.nombre,
                        precio: parseFloat(producto.precio) || 0,
                        cantidad: 1
                    });
                }

                renderizarTablaCarrito();
                calcularTotales();
            });
        }
    };

    function renderizarTablaCarrito() {
        if (!tablaCarrito) return;
        tablaCarrito.innerHTML = "";

        carrito.forEach((item, index) => {
            let subtotalItem = item.precio * item.cantidad;
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${esc(item.nombre)}</td>
                <td>$${item.precio.toLocaleString("es-CO")}</td>
                <td>
                    <input type="number" value="${item.cantidad}" min="1"
                           class="form-control" style="width: 80px;"
                           onchange="actualizarCantidad(${index}, this.value)">
                </td>
                <td>$${subtotalItem.toLocaleString("es-CO")}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="eliminarProducto(${index})">
                        X
                    </button>
                </td>
            `;
            tablaCarrito.appendChild(fila);
        });
    }

    window.eliminarProducto = function (index) {
        carrito.splice(index, 1);
        renderizarTablaCarrito();
        calcularTotales();
    };

    window.actualizarCantidad = function (index, nuevaCantidad) {
        let cant = parseInt(nuevaCantidad, 10);
        carrito[index].cantidad = cant > 0 ? cant : 1;
        renderizarTablaCarrito();
        calcularTotales();
    };

    function calcularTotales() {
        let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        // Tratamos el descuento como PORCENTAJE (%)
        let porcentajeDescuento = parseFloat(descuentoInput ? descuentoInput.value : 0) || 0;
        let descuentoDinero = (subtotalGeneral * porcentajeDescuento) / 100;

        let aumentoDinero = parseFloat(aumentoInput ? aumentoInput.value : 0) || 0;

        let totalFinal = (subtotalGeneral + aumentoDinero) - descuentoDinero;
        if (totalFinal < 0) totalFinal = 0;

        if (totalPantalla) {
            totalPantalla.textContent = `$${Math.round(totalFinal).toLocaleString("es-CO")}`;
        }
    }

    // Función que lee el carrito y procesa los datos exactos para enviar al backend
    window.obtenerDatosCarrito = function () {
        let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        let porcentajeDescuento = parseFloat(descuentoInput ? descuentoInput.value : 0) || 0;
        let descuentoDinero = (subtotalGeneral * porcentajeDescuento) / 100; // Transformado a dinero real para la BD
        let aumentoDinero = parseFloat(aumentoInput ? aumentoInput.value : 0) || 0;

        return {
            productos: carrito.map((item) => ({
                id_producto: item.id_producto,
                precio: item.precio,
                cantidad: item.cantidad
            })),
            descuento: descuentoDinero,
            aumento: aumentoDinero,
            total: (subtotalGeneral + aumentoDinero) - descuentoDinero
        };
    };

    // Limpieza de inputs al hacer foco
    [descuentoInput, aumentoInput].forEach((input) => {
        if (input) {
            input.addEventListener("focus", function () {
                if (this.value === "0" || this.value === "0.00") this.value = "";
                else this.select();
            });

            input.addEventListener("blur", function () {
                if (this.value.trim() === "") this.value = "0";
            });

            input.addEventListener("input", calcularTotales);
        }
    });
})();
