(function () {
    let formularioCliente = document.querySelector("#formulario-cliente");
    let nombreCli = document.querySelector("#nombre-cli");
    let apellidoCli = document.querySelector("#apellido-cli");
    let emailCli = document.querySelector("#email-cli");
    let celularCli = document.querySelector("#celular-cli");
    let direccionCli = document.querySelector("#direccion-cli");
    let direccion2Cli = document.querySelector("#direccion2-cli");
    let descripcionCli = document.querySelector("#descripcion-cli");
    let btnCrear = document.querySelector("#btn-crear");

    // --- Punto de entrada: si la URL trae id=X, estamos en modo edición ---
    const params = new URLSearchParams(window.location.search);
    const idEditando = params.get("id"); // null si no viene -> modo "crear"

    document.addEventListener("DOMContentLoaded", () => {
        if (idEditando) {
            cargarClienteParaEditar(idEditando);
        }
    });

    // --- Validación: separa la responsabilidad de "leer + validar" del resto ---
    function validForm() {
        let cli;
        if (nombreCli.value && apellidoCli.value && emailCli.value && celularCli.value && direccionCli.value) {
            cli = {
                nombre: nombreCli.value,
                apellido: apellidoCli.value,
                email: emailCli.value,
                celular: celularCli.value,
                direccion: direccionCli.value,
                direccion2: direccion2Cli.value,
                descripcion: descripcionCli.value
            };
        } else {
            alert("Faltan campos obligatorios");
        }
        return cli;
    }

    // --- Carga de datos existentes cuando venimos a editar ---
    async function cargarClienteParaEditar(id) {
        try {
            // Reutilizamos la capa de API (cliente-api.js) en vez de repetir el fetch.
            let cliente = await obtenerClientePorIdApi(id);

            nombreCli.value = cliente.nombre;
            apellidoCli.value = cliente.apellido;
            emailCli.value = cliente.email;
            celularCli.value = cliente.celular;
            direccionCli.value = cliente.direccion;
            direccion2Cli.value = cliente.direccion2 ?? "";
            descripcionCli.value = cliente.descripcion ?? "";

            btnCrear.dataset.idEditando = id;
            btnCrear.textContent = "Actualizar";

        } catch (error) {
            console.error(error);
            alert("No se pudo cargar el cliente para editar");
        }
    }

    async function guardarCliente() {
        let cliente = validForm();
        if (!cliente) return;

        // Nota: si nunca pasamos por cargarClienteParaEditar(), este dataset
        // no existe, entonces idEditandoActual acá es undefined -> modo "crear".
        let idEditandoActual = btnCrear.dataset.idEditando;

        try {
            let resultado;

            if (idEditandoActual) {
                resultado = await actualizarClienteApi(idEditandoActual, cliente);
            } else {
                resultado = await crearClienteApi(cliente);
            }

            console.log("Guardado:", resultado);

            alert(idEditandoActual ? "Cliente actualizado con éxito" : "Cliente creado con éxito");
            window.location.href = "listado-clientes.html";

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    formularioCliente.addEventListener("submit", (evento) => {
        evento.preventDefault();
        guardarCliente();
    });
})();
