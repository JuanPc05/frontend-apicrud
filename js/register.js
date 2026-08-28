let formularioRegistro = document.querySelector("#formulario-registro");
let firstName = document.querySelector("#exampleFirstName");
let lastName = document.querySelector("#exampleLastName");
let emailRegistro = document.querySelector("#exampleInputEmail");
let passwordRegistro = document.querySelector("#exampleInputPassword");
let repeatPassword = document.querySelector("#exampleRepeatPassword");
let rolRegistro = document.querySelector("#rolRegistro");

formularioRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Comentario: esta validación es exclusiva del registro, el login no la
    // necesita — por eso vive acá y no en una función compartida.
    if (passwordRegistro.value !== repeatPassword.value) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: firstName.value,
                apellido: lastName.value,
                email: emailRegistro.value,
                password: passwordRegistro.value,
                rol: rolRegistro.value
            })
        });

        if (!response.ok) {
            throw new Error(`Error al registrar: ${response.status}`);
        }

        alert("Cuenta creada con éxito, ahora podés iniciar sesión");
        window.location.href = "login.html";

    } catch (error) {
        console.log(error);
        alert(error.message);
    }
});