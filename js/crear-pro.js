let nombrePro = document.querySelector("#productos-select");
let precioPro = document.querySelector("#precio-pro");
let descripcionPro = document.querySelector("#descripcion-pro"); 
let stockPro = document.querySelector("#stock-pro");             
let imagenPro = document.querySelector("#imagen-pro");
let btnCrear = document.querySelector("#btn-crear");

btnCrear.addEventListener("click", () => {
    let producto = validForm();
    console.log(producto);
});

function validForm() {
    let pro;
    if (nombrePro.value && precioPro.value && stockPro.value) {
        pro = {
            nombre: nombrePro.value,
            precio: precioPro.value,
            descripcion: descripcionPro.value,
            stock: stockPro.value,
            imagen: imagenPro.value
        }
    } else {
        alert("Faltan campos obligatorios")
    }
    return pro;
}

