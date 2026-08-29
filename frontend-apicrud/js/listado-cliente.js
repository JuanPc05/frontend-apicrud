
let tablaCliente = document.querySelector("#tabla-clientes tbody");


document.addEventListener("DOMContentLoaded", () => {
    getClients();
});

async function getClients() {
    try {
        let url = "http://localhost:3000/api/clientes";
        let data = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json" 
            }
        });


        if (!data.ok) {
            throw new Error(`Error del servidor: ${data.status}`);
        }

        let clients = await data.json();
        console.log(clients);

        tablaCliente.innerHTML = "";

        clients.forEach((client, ) => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${client.id_cliente}</td>
                <td>${client.nombre}</td>
                <td>${client.apellido}</td>
                <td>${client.email}</td>
                <td>${client.celular}</td>
                <td>${client.direccion}</td>
                <td>    
                    <button class="btn btn-warning">editar</button>
                    <button class="btn btn-danger">borrar</button>
                </td>
            `;
            tablaCliente.appendChild(fila);
        });
    } catch (error) {
        console.log(error);
    }
}