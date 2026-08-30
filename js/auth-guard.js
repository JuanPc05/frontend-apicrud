// ============================================
// auth-guard.js
// Protege las páginas privadas: si no hay sesión en sessionStorage,
// redirige al login. También limpia la sesión al pulsar "Logout".
//
// OJO: esto NO es seguridad real. El backend debe validar el usuario/rol
// en cada endpoint. Esto solo hace coherente el flujo de la interfaz.
// ============================================

(function () {
    const usuarioActual = JSON.parse(sessionStorage.getItem("usuarioActual") || "null");

    if (!usuarioActual) {
        window.location.href = "login.html";
        return;
    }

    // El botón "Logout" del modal es un <a href="login.html">; le añadimos
    // el borrado de la sesión sin tener que tocar el HTML de cada página.
    document.addEventListener("DOMContentLoaded", () => {
        const logoutLink = document.querySelector('#logoutModal a.btn-primary');
        if (logoutLink) {
            logoutLink.addEventListener("click", () => {
                sessionStorage.removeItem("usuarioActual");
            });
        }
    });
})();
