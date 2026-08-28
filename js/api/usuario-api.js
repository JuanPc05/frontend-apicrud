// ============================================
// api/usuario-api.js
// Única capa que sabe hablar HTTP con el backend para el recurso "usuario".
// Mismo patrón que cliente-api.js, apuntando a /api/usuarios.
// ============================================

const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";

// --- CREATE ---
async function crearUsuarioApi(usuario) {
    const response = await fetch(API_URL_USUARIOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    if (!response.ok) {
        throw new Error(`Error al crear usuario: ${response.status}`);
    }

    return response.json();
}

// --- READ (todos) ---
async function listarUsuariosApi() {
    const response = await fetch(API_URL_USUARIOS, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
}

// --- READ (uno por id) ---
async function obtenerUsuarioPorIdApi(id) {
    const response = await fetch(`${API_URL_USUARIOS}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
    }

    return response.json();
}

// --- UPDATE ---
async function actualizarUsuarioApi(id, usuario) {
    const response = await fetch(`${API_URL_USUARIOS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    if (!response.ok) {
        throw new Error(`Error al actualizar usuario: ${response.status}`);
    }

    return response.json();
}

// --- DELETE ---
async function eliminarUsuarioApi(id) {
    const response = await fetch(`${API_URL_USUARIOS}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error(`Error al eliminar usuario: ${response.status}`);
    }
}