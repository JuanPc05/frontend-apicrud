// Variables globales para la lógica del carrito
let carrito = [];
let listaProductosGlobal = [];

// Elementos del DOM que maneja este archivo
let selectProductos = document.querySelector("#select-productos");
let btnAgregarProducto = document.querySelector("#btn-agregar-producto");
let tablaCarrito = document.querySelector("#tabla-carrito tbody");
let descuentoInput = document.querySelector("#descuento");
let aumentoInput = document.querySelector("#aumento");
let spanTotal = document.querySelector("#total-pedido");

// Función para recibir la lista de productos desde el otro archivo (crear-pedido.js)
function inicializarCarrito(productosBD) {
    listaProductosGlobal = productosBD;
    
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener("click", () => {
            agregarProductoAlCarrito();
        });
    }

    if (descuentoInput) descuentoInput.addEventListener("input", renderizarCarrito);
    if (aumentoInput) aumentoInput.addEventListener("input", renderizarCarrito);
}

function agregarProductoAlCarrito() {
    let idProductoSeleccionado = selectProductos.value;
    let productoEncontrado = listaProductosGlobal.find(p => p.id == idProductoSeleccionado);

    if (!productoEncontrado) {
        alert("Por favor selecciona un producto válido");
        return;
    }

    let itemExistente = carrito.find(item => item.id_producto == productoEncontrado.id);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id_producto: productoEncontrado.id,
            nombre: productoEncontrado.nombre,
            precio: parseFloat(productoEncontrado.precio),
            cantidad: 1
        });
    }
    renderizarCarrito();
}

function renderizarCarrito() {
    if (!tablaCarrito) return;
    tablaCarrito.innerHTML = "";
    let subtotalGeneral = 0;

    carrito.forEach((item, index) => {
        let subtotal = item.precio * item.cantidad;
        subtotalGeneral += subtotal;

        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio}</td>
            <td><input type="number" class="form-control form-control-sm w-50" value="${item.cantidad}" min="1" onchange="cambiarCantidad(${index}, this.value)"></td>
            <td>$${subtotal}</td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${index})">X</button></td>
        `;
        tablaCarrito.appendChild(fila);
    });

    // Obtenemos el porcentaje ingresado (ej: 10 para un 10%)
    let porcentajeDescuento = parseFloat(descuentoInput ? descuentoInput.value : 0) || 0;
    let aumento = parseFloat(aumentoInput ? aumentoInput.value : 0) || 0;

    // Calculamos el valor en dinero del descuento basado en el subtotal
    let valorDescuentoDinero = (subtotalGeneral * porcentajeDescuento) / 100;
    
    // Total final aplicando el porcentaje de descuento y sumando el envío/aumento
    let totalFinal = (subtotalGeneral - valorDescuentoDinero) + aumento;
    
    if (spanTotal) {
        spanTotal.textContent = `$${totalFinal > 0 ? totalFinal.toFixed(2) : 0}`;
    }
}

function obtenerDatosCarrito() {
    let porcentajeDescuento = parseFloat(descuentoInput ? descuentoInput.value : 0) || 0;
    let aumento = parseFloat(aumentoInput ? aumentoInput.value : 0) || 0;
    
    let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    let valorDescuentoDinero = (subtotalGeneral * porcentajeDescuento) / 100;
    let totalFinal = (subtotalGeneral - valorDescuentoDinero) + aumento;

    return {
        productos: carrito.map(item => ({
            id_producto: item.id_producto,
            precio: item.precio,
            cantidad: item.cantidad
        })),
        descuento: valorDescuentoDinero, // O puedes mandar porcentajeDescuento si tu BD guarda el porcentaje directo
        aumento: aumento,
        total: totalFinal
    };
}