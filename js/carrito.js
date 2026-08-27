let carrito = [];

const btnAgregar = document.querySelector("#btn-agregar-producto");
const selectProducto = document.querySelector("#select-productos");
const tablaCarrito = document.querySelector("#tabla-carrito tbody");
const descuentoInput = document.querySelector("#descuento");
const aumentoInput = document.querySelector("#aumento");
const totalPantalla = document.querySelector("#total-pedido");

// Función que recibe los productos desde crear-pedido.js
window.inicializarCarrito = function(productosDisponibles) {
    if (btnAgregar) {
        // Evitamos duplicar eventos limpiando el clon o usando una bandera
        btnAgregar.replaceWith(btnAgregar.cloneNode(true));
        const btnAgregarNuevo = document.querySelector("#btn-agregar-producto");

        btnAgregarNuevo.addEventListener("click", (e) => {
            e.preventDefault();
            let optionSeleccionada = selectProducto.options[selectProducto.selectedIndex];
            
            if (!optionSeleccionada || optionSeleccionada.value === "" || optionSeleccionada.disabled) {
                alert("Por favor selecciona un producto válido.");
                return;
            }

            let idProducto = parseInt(optionSeleccionada.value);
            let textoProducto = optionSeleccionada.text; // Ejemplo: "Hamburguesa - $30000.00"
            let nombreProducto = textoProducto.split(" - $")[0];
            
            // Extraemos el precio limpiando el texto del option
            let precioTexto = textoProducto.split(" - $")[1];
            let precioProducto = parseFloat(precioTexto) || 0;

            let existe = carrito.find(item => item.id_producto === idProducto);
            if (existe) {
                existe.cantidad += 1;
            } else {
                carrito.push({
                    id_producto: idProducto,
                    nombre: nombreProducto,
                    precio: precioProducto,
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
            <td>${item.nombre}</td>
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

window.eliminarProducto = function(index) {
    carrito.splice(index, 1);
    renderizarTablaCarrito();
    calcularTotales();
};

window.actualizarCantidad = function(index, nuevaCantidad) {
    let cant = parseInt(nuevaCantidad);
    if (cant > 0) {
        carrito[index].cantidad = cant;
    } else {
        carrito[index].cantidad = 1;
    }
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
window.obtenerDatosCarrito = function() {
    let subtotalGeneral = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    let porcentajeDescuento = parseFloat(descuentoInput ? descuentoInput.value : 0) || 0;
    let descuentoDinero = (subtotalGeneral * porcentajeDescuento) / 100; // Transformado a dinero real para la BD
    let aumentoDinero = parseFloat(aumentoInput ? aumentoInput.value : 0) || 0;

    return {
        productos: carrito.map(item => ({
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
[descuentoInput, aumentoInput].forEach(input => {
    if (input) {
        input.addEventListener("focus", function() {
            if (this.value === "0" || this.value === "0.00") this.value = "";
            else this.select();
        });
        
        input.addEventListener("blur", function() {
            if (this.value.trim() === "") this.value = "0";
        });

        input.addEventListener("input", calcularTotales);
    }
});