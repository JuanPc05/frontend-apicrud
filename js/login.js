// ============================================
// login.js
// Autenticación contra POST /api/login.
// ============================================

let formularioLogin = document.querySelector("#formulario-login");
let usuarioLogin = document.querySelector("#exampleInputEmail"); // el id del HTML sigue siendo este, aunque ahora es un nombre de usuario, no un email
let passwordLogin = document.querySelector("#exampleInputPassword");

formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    
    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: usuarioLogin.value,
                contrasena: passwordLogin.value
            })
        });

        if (!response.ok) {
            throw new Error("Credenciales incorrectas");
        }

        const usuario = await response.json(); // { id, rol, usuario }
        sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});