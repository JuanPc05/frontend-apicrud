(function () {
    let nombrePro = document.querySelector("#productos-select");
    let precioPro = document.querySelector("#precio-pro");
    let descripcionPro = document.querySelector("#descripcion-pro");
    let stockPro = document.querySelector("#stock-pro");
    let imagenPro = document.querySelector("#imagen-pro");
    let btnCrear = document.querySelector("#btn-crear");

    const API_URL = "http://localhost:3000/api/productos";

    btnCrear.addEventListener("click", guardarProducto);

    // --- Validación ---
    function validForm() {
        let pro;
        if (nombrePro.value && precioPro.value && stockPro.value) {
            pro = {
                nombre: nombrePro.value,
                precio: Number(precioPro.value),
                descripcion: descripcionPro.value,
                stock: Number(stockPro.value),
                imagen: imagenPro.src
            };
        } else {
            alert("Faltan campos obligatorios");
        }
        return pro;
    }

    // --- Guardar (Create) ---
    async function guardarProducto() {
        let producto = validForm();
        if (!producto) return;

        try {
            let data = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producto)
            });

            if (!data.ok) {
                throw new Error(`No se pudo crear el producto (status ${data.status})`);
            }

            let resultado = await data.json();
            console.log("Creado:", resultado);

            alert("Producto creado con éxito");
            limpiarFormulario();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function limpiarFormulario() {
        nombrePro.selectedIndex = 0;
        precioPro.value = "";
        descripcionPro.value = "";
        stockPro.value = "";
    }
})();
