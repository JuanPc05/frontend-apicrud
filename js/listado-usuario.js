// ============================================
// listado-usuarios.js
// Lista los usuarios, delega edición a crear-usuario.html.
// Depende de listarUsuariosApi/eliminarUsuarioApi en api/usuario-api.js.
// ============================================

(function () {
    let tablaUsuarios = document.querySelector("#tabla-usuarios");

    // Escape para evitar inyección de HTML al pintar datos de la API.
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

    document.addEventListener("DOMContentLoaded", () => {
        getUsers();
    });

    async function getUsers() {
        try {
            let usuarios = await listarUsuariosApi();
            tablaUsuarios.innerHTML = "";

            usuarios.forEach((usuario) => {
                let fila = document.createElement("tr");

                // Comentario: created_at llega como timestamp ISO (ej. "2026-08-27T14:30:00.000Z").
                // toLocaleDateString() lo convierte a un formato legible según la config
                // regional del navegador (ej. "27/8/2026"), en vez de mostrar el string crudo.
                let fechaCreado = usuario.created_at
                    ? new Date(usuario.created_at).toLocaleDateString()
                    : "";

                fila.innerHTML = `
                    <td>${esc(usuario.id)}</td>
                    <td>${esc(usuario.usuario)}</td>
                    <td>${esc(usuario.rol)}</td>
                    <td>${esc(fechaCreado)}</td>
                    <td>
                        <button class="btn btn-warning btn-editar">editar</button>
                        <button class="btn btn-danger btn-borrar">borrar</button>
                    </td>
                `;
                tablaUsuarios.appendChild(fila);
            });
        } catch (error) {
            console.error(error);
            tablaUsuarios.innerHTML = `<tr><td colspan="5" class="text-center text-danger">
                No se pudieron cargar los usuarios. ¿Está corriendo el servidor?</td></tr>`;
        }
    }

    tablaUsuarios.addEventListener("click", (evento) => {
        if (evento.target.classList.contains("btn-editar")) {
            let fila = evento.target.closest("tr");
            let id = fila.querySelector("td").textContent;
            irAEditarUsuario(id);
        }

        if (evento.target.classList.contains("btn-borrar")) {
            let fila = evento.target.closest("tr");
            let id = fila.querySelector("td").textContent;
            eliminarUsuario(id);
        }
    });

    function irAEditarUsuario(id) {
        window.location.href = `crear-usuario.html?id=${id}`;
    }

    async function eliminarUsuario(id) {
        let confirmar = confirm("¿Seguro que querés eliminar este usuario?");
        if (!confirmar) return;

        try {
            await eliminarUsuarioApi(id);
            alert("Usuario eliminado con éxito");
            getUsers();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }
})();
