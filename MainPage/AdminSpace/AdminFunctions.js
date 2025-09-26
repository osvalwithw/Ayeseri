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
            const infoTicket = {
                id: ticketId,
                usuario: usuario,
                email: email
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
    SelectTickets.forEach(element => {
        console.log(`Creating user: ${element.usuario} with email: ${element.email}`)
    });
    // try{
    //     const response = await fetch(`https://ayeseri.onrender.com/InsertUsers/`);
    // } catch(error){
    //     console.error("Error inserting users:", error);
    // }
}