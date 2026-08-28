formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: usuarioLogin.value,      // antes: email
                contrasena: passwordLogin.value    // antes: password
            })
        });

        if (!response.ok) {
            throw new Error("Credenciales incorrectas");
        }

        const usuario = await response.json(); // { id, rol, usuario } -- SIN "nombre"
        sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));

        window.location.href = "index.html";

    } catch (error) {
        console.log(error);
        alert(error.message);
    }
});