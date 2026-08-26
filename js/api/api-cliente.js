const API_URL = "http://localhost:3000/api/clientes";

async function crearClienteApi(cliente) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    if (!response.ok) {
        throw new Error(`Error al crear cliente: ${response.status}`);
    }

    return response.json();
}

async function actualizarClienteApi(id, cliente) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar cliente: ${response.status}`);
    }

    return response.json();
}


async function eliminarClienteApi(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Error al eliminar cliente: ${response.status}`);
    }

}