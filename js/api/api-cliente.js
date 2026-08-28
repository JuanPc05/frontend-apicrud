// ============================================
// api/cliente-api.js
// Única capa que sabe hablar HTTP con el backend para el recurso "cliente".
// Nadie fuera de este archivo debería conocer la URL ni el formato exacto
// de las peticiones. El resto del código solo llama a estas funciones.
// ============================================

const API_URL = "http://localhost:3000/api/clientes";

// --- CREATE ---
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

// --- READ (todos) ---
async function listarClientesApi() {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
}

// --- READ (uno por id) ---
async function obtenerClientePorIdApi(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
}

// --- UPDATE ---
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

// --- DELETE ---
async function eliminarClienteApi(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Error al eliminar cliente: ${response.status}`);
    }

    // Nota: no llamamos a response.json() acá porque un DELETE exitoso
    // suele devolver 204 No Content, sin body que parsear.
}

