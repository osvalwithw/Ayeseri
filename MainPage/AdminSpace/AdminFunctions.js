let SelectTickets = [];
const tablaBody = document.getElementById('TableItems');

function AdminView(ViewOPC){
    const windows = [
    document.getElementById("Usersview"),
    document.getElementById("Errorsview"),
    document.getElementById("UserCreationView")
    ];
    windows.forEach(window => {
        window.style.display = 'none'
    });
    if(windows[ViewOPC]){
        windows[ViewOPC].style.display = 'block';
        if(ViewOPC === 2){
            bringtickets();
        }
    }
}

async function bringtickets(){
    fetch(`https://ayeseri.onrender.com/GetTickets`)
    .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
    printingtickets(data);
    })
    .catch(err => {
    console.error("Failed to load errors, please review the API Conection or logs", err);
    });
}

AdminView(2);

function printingtickets(data){
    const pasteinformation = document.getElementById('TableItems');
    pasteinformation.innerHTML = '';
    data.forEach(item => {
        let insertline = document.createElement('tr');
        insertline.innerHTML=`
            <td><input class="DBRequestContent" id="Checkbox_${item.id}" type="checkbox" value=${item.id}></td>
            <td>${item.NoTicket}</td>
            <td class="User_Row" id="User_${item.id}">${item.User}</td>
            <td class="Email_Row" id="Email_${item.id}">${item.Email}</td>
            <td class="Pss_row">${item.Psswd}</td>
            <td>${item.Upload_Time}</td>
        `;
        pasteinformation.appendChild(insertline);
    });
}

tablaBody.addEventListener('change', function(event) {
    if (event.target.matches('.DBRequestContent')) {
        const checkbox = event.target;
        const ticketId = checkbox.value;
        if (checkbox.checked) {
            const fila = checkbox.closest('tr');
            const usuario = fila.querySelector('.User_Row').textContent;
            const email = fila.querySelector('.Email_Row').textContent;
            const pss = fila.querySelector('.Pss_row').textContent;
            const infoTicket = {
                id: ticketId,
                usuario: usuario,
                email: email,
                pss: pss
            };
            SelectTickets.push(infoTicket);
        } else {
            SelectTickets = SelectTickets.filter(ticket => ticket.id !== ticketId);
        }
        console.log("Tickets seleccionados actualmente:", SelectTickets);
    }
});

async function CreateUsers(){
    if(SelectTickets.length === 0){
        alert("No Tickets selected, please select at least one to proceed");
        return;
    }
    try {
        // Hacemos la petición 'fetch' y esperamos la respuesta con 'await'
        const respuesta = await fetch(`https://ayeseri.onrender.com/CreateUsers`, {
            method: 'POST', // El método HTTP para enviar datos
            headers: {
                // Le decimos a la API que le estamos enviando datos en formato JSON
                'Content-Type': 'application/json'
            },
            // Convertimos nuestro array de JavaScript a una cadena de texto JSON
            body: JSON.stringify(SelectTickets) 
        });

        // Verificamos si la respuesta del servidor fue exitosa (código 200-299)
        if (!respuesta.ok) {
            // Si hubo un error en el servidor (ej: 404, 500), lanzamos un error
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        // Si la respuesta fue exitosa, la convertimos de JSON a un objeto de JavaScript
        const datosRespuesta = await respuesta.json();
        
        console.log('Éxito! Respuesta del servidor:', datosRespuesta);
        alert('Los tickets se procesaron correctamente.');
        
        // Aquí podrías, por ejemplo, recargar tu tabla de pendientes
        // recargarTabla();

    } catch (error) {
        // Si algo falla (ej: no hay conexión a internet, la API está caída), lo capturamos aquí
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}