(function () {
    let formularioUsuario = document.querySelector("#formulario-usuario");
    let usuarioInput = document.querySelector("#usuario");
    let contrasenaInput = document.querySelector("#contrasena");
    let confirmarContrasenaInput = document.querySelector("#confirmar_contrasena");
    let rolInput = document.querySelector("#rol");
    let btnCrearUsuario = document.querySelector("#btn-crear-usuario");

    const params = new URLSearchParams(window.location.search);
    const idEditando = params.get("id");

    document.addEventListener("DOMContentLoaded", () => {
        if (idEditando) {
            btnCrearUsuario.textContent = "Actualizar";
            contrasenaInput.required = false;
            confirmarContrasenaInput.required = false;
            cargarUsuarioParaEditar(idEditando);
        }
    });

    // --- Validación ---
    function validForm() {
        let usu;

        // La contraseña solo es obligatoria si NO estamos editando.
        let contrasenaValida = idEditando ? true : contrasenaInput.value;

        if (usuarioInput.value && rolInput.value && contrasenaValida) {

            // Si se escribió una contraseña (sea creando o editando),
            // debe coincidir con su confirmación.
            if (contrasenaInput.value && contrasenaInput.value !== confirmarContrasenaInput.value) {
                alert("Las contraseñas no coinciden");
                return undefined;
            }

            usu = {
                usuario: usuarioInput.value,
                rol: rolInput.value
            };

            // Solo agregamos "contrasena" al objeto si el usuario escribió algo.
            // Así, en modo edición sin cambios de clave, la propiedad ni existe
            // en el objeto que se manda al backend.
            if (contrasenaInput.value) {
                usu.contrasena = contrasenaInput.value;
            }
        } else {
            alert("Faltan campos obligatorios");
        }

        return usu;
    }

    // --- Carga de datos existentes al editar ---
    async function cargarUsuarioParaEditar(id) {
        try {
            let usuario = await obtenerUsuarioPorIdApi(id);

            usuarioInput.value = usuario.usuario;
            rolInput.value = usuario.rol;
            // La contraseña nunca se precarga.

            btnCrearUsuario.dataset.idEditando = id;

        } catch (error) {
            console.error(error);
            alert("No se pudo cargar el usuario para editar");
        }
    }

    // --- Guardar (crear o actualizar) ---
    async function guardarUsuario() {
        let usuario = validForm();
        if (!usuario) return;

        let idEditandoActual = btnCrearUsuario.dataset.idEditando;

        try {
            let resultado;

            if (idEditandoActual) {
                resultado = await actualizarUsuarioApi(idEditandoActual, usuario);
            } else {
                resultado = await crearUsuarioApi(usuario);
            }

            console.log("Guardado:", resultado);

            delete btnCrearUsuario.dataset.idEditando;
            btnCrearUsuario.textContent = "Crear Usuario";
            limpiarFormularioUsuario();

            alert(idEditandoActual ? "Usuario actualizado con éxito" : "Usuario creado con éxito");

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function limpiarFormularioUsuario() {
        usuarioInput.value = "";
        contrasenaInput.value = "";
        confirmarContrasenaInput.value = "";
        rolInput.value = "";
        contrasenaInput.required = true;
        confirmarContrasenaInput.required = true;
    }

    formularioUsuario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        guardarUsuario();
    });
})();
