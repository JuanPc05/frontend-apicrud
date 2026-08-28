let tablaCliente = document.querySelector("#tabla-clientes tbody");

document.addEventListener("DOMContentLoaded", () => {
  getClients();
});

async function getClients() {
  try {
    let clients = await listarClientesApi();
    tablaCliente.innerHTML = "";
    clients.forEach((client) => {
      let fila = document.createElement("tr");
      fila.innerHTML = `
                <td>${client.id_cliente}</td>
                <td>${client.nombre}</td>
                <td>${client.apellido}</td>
                <td>${client.email}</td>
                <td>${client.celular}</td>
                <td>${client.direccion}</td>
                <td>    
                    <button class="btn btn-warning btn-editar">editar</button>
                    <button class="btn btn-danger btn-borrar">borrar</button>
                </td>
            `;
      tablaCliente.appendChild(fila);
    });
  } catch (error) {
    console.log(error);
  }
}

// Comentario: este listener se agrega UNA sola vez, no importa cuántas filas
// se creen o destruyan después. Es más eficiente en memoria.
tablaCliente.addEventListener("click", (evento) => {
  console.log("Este click funciono!!")
  if (evento.target.classList.contains("btn-editar")) {
    let fila = evento.target.closest("tr"); // sube al <tr> padre
    let id = fila.querySelector("td").textContent; // primer <td> = id_cliente
    irAEditar(id);
  }

  if (evento.target.classList.contains("btn-borrar")) {
    let fila = evento.target.closest("tr");
    let id = fila.querySelector("td").textContent;
    eliminarCliente(id);
  }
});

function irAEditar(id) {
    window.location.href = `crear-cliente.html?id=${id}`;
}

async function eliminarCliente(id) {
    let confirmar = confirm("¿Seguro que querés eliminar este cliente?");
    if (!confirmar) return;

    try {
        await eliminarClienteApi(id);
        alert("Cliente eliminado con éxito");
        getClients();
    } catch (error) {
        console.log(error);
        alert(error.message);
    }
}
