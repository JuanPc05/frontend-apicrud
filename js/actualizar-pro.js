let nombrePro = document.querySelector("#productos-select");
let precioPro = document.querySelector("#precio-pro");
let descripcionPro = document.querySelector("#descripcion-pro");
let stockPro = document.querySelector("#stock-pro");
let imagenPro = document.querySelector("#imagen-pro");
let btnActualizar = document.querySelector("#btn-actualizar");

const API_URL = "http://localhost:3000/api/productos";

// Obligatorio: esta página siempre necesita el id del producto en la URL
const params = new URLSearchParams(window.location.search);
const idProducto = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    if (!idProducto) {
        alert("No se especificó qué producto actualizar");
        return;
    }
    cargarProducto(idProducto);
});

btnActualizar.addEventListener("click", actualizarProducto);

// --- Validación (misma lógica que en crear-producto.js) ---
function validForm() {
    let pro;
    if (nombrePro.value && precioPro.value && stockPro.value) {
        pro = {
            nombre: nombrePro.value,
            precio: precioPro.value,
            descripcion: descripcionPro.value,
            stock: stockPro.value,
            imagen: imagenPro.src
        }
    } else {
        alert("Faltan campos obligatorios")
    }
    return pro;
}

// --- READ: trae los datos actuales del producto para precargar el form ---
async function cargarProducto(id) {
    try {
        let data = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!data.ok) {
            throw new Error(`Error del servidor: ${data.status}`);
        }

        let producto = await data.json();

        nombrePro.value = producto.nombre;
        precioPro.value = producto.precio;
        descripcionPro.value = producto.descripcion ?? "";
        stockPro.value = producto.stock;
        imagenPro.src = producto.imagen ?? imagenPro.src;

    } catch (error) {
        console.log(error);
        alert("No se pudo cargar el producto");
    }
}

// --- UPDATE ---
async function actualizarProducto() {
    let producto = validForm();
    if (!producto) return;

    try {
        let data = await fetch(`${API_URL}/${idProducto}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        if (!data.ok) {
            throw new Error(`No se pudo actualizar el producto (status ${data.status})`);
        }

        let resultado = await data.json();
        console.log("Actualizado:", resultado);

        alert("Producto actualizado con éxito");
        window.location.href = "listado-pro.html";

    } catch (error) {
        console.log(error);
        alert(error.message);
    }
}