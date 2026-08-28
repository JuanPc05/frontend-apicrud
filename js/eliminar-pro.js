const API_URL_DELETE = "http://localhost:3000/api/productos";

async function eliminarProducto(id, btn) {
    let confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
        let data = await fetch(`${API_URL_DELETE}/${id}`, {
            method: "DELETE"
        });

        if (!data.ok) {
            throw new Error(`No se pudo eliminar el producto (status ${data.status})`);
        }

        alert("Producto eliminado con éxito");

        // Si el botón viene de una fila de tabla, la quita del DOM sin recargar
        if (btn) {
            btn.closest("tr").remove();
        }

    } catch (error) {
        console.log(error);
        alert(error.message);
    }
}