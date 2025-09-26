let SelectTickets = [];
const tablaBody = document.getElementById('TableItems');

function AdminView(ViewOPC){
    const windows = [
    document.getElementById("Usersview"),
    document.getElementById("Errorsview"),
    document.getElementById("UserCreationView")
    ];
    windows.forEach(window => {
        window.style.display = 'none';
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
    console.log(data);
        if(data.length == 0){
            document.getElementById('TableItems').style.display = "none";
        }
    printingtickets(data);
    })
    .catch(err => {
    console.error("Failed to load errors, please review the API Conection or logs", err);
    });
}

AdminView(2);

function printingtickets(data){
    if(data.length === 0){
        alert("No hay tickets por procesar :D")
        return;
    }
    const pasteinformation = document.getElementById('TableItems');
    const headerinformation = document.getElementById('Tableheaders');
    pasteinformation.innerHTML = '';
    let insertheader = document.createElement('tr');
    insertheader.innerHTML=`
        <th></th>
        <th>Ticket Number</th>
        <th>User Name</th>
        <th>Email</th>
        <th>Password</th>
        <th>Upload Time</th>
    `;
    headerinformation.appendChild(insertheader);
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

async function ProcessTickets(OPC){
    if(SelectTickets.length === 0){
        alert("No Tickets selected, please select at least one to proceed");
        return;
    }
    console.log("Enviando este cuerpo JSON a la API:", JSON.stringify({ SendTickets:SelectTickets}, null, 2));
    try {
        const respuesta = await fetch(`https://ayeseri.onrender.com/CreateUsers/${OPC}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ SendTickets:SelectTickets}) 
        });
        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        const datosRespuesta = await respuesta.json();
        console.log('Éxito! Respuesta del servidor:', datosRespuesta);
        alert('Los tickets se procesaron correctamente.');
        bringtickets();       
        SelectTickets = [];
    } catch (error) {
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}

async function NoProcessUser(){
    if(SelectTickets.length === 0){
        alert("No Tickets selected, please select at least one to proceed");
        return;
    }
    if(confirm("¿Seguro que quieres eliminar al/los empleado(s) seleccionado(s)?")){
        console.log(":)")
        ProcessTickets(2);
    } else {
        return;
    }
}