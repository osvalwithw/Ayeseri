let Window_opc = 2;
const windows = [
    document.getElementById("Usersview"),
    document.getElementById("Errorsview"),
    document.getElementById("UserCreationView"),
    document.getElementById("PSSMaintenanceView")
    ];

document.addEventListener('DOMContentLoaded', windows.forEach(item =>
    item.style.display = 'none')
);

window.addEventListener('resize', () =>{
    windowadjust();
});

async function windowadjust(){
    let windowsize = window.innerWidth;
    windows.forEach(item => item.style.display = 'none');
    if(windowsize <= 1000){
        windows[Window_opc].style.display = 'block';
    } else {
        windows[Window_opc].style.display = 'flex';
    }
}
//--------------------------------------------User creation------------------------------------------------------------{
let SelectTickets = [];
const tablaBody = document.getElementById('TableItems');

async function bringtickets(){
    Window_opc = 2;
    windowadjust();
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

//--------------------------------------------User creation------------------------------------------------------------}

//--------------------------------------------Error Load------------------------------------------------------------
function DBErrorUpload(){
    Window_opc = 1;
    windowadjust();
}

const FakeEntrySingleFileLoad = document.getElementById('FakeSingleLoad');
const EntrySingleFileLoad = document.getElementById('SingleLoad');
const ButtonSingleFileLoad = document.getElementById('BTNSingleLoad');
const EntryMultipleFileLoad = document.getElementById('MultipleLoad');
const ButtonMultiplleFileLoad = document.getElementById('BTNMultipleLoad');
const Proceedbutton = document.getElementById('ConfirmLoad');
let Filetoprocess = "";

ButtonSingleFileLoad.addEventListener('click',() =>{
    EntrySingleFileLoad.click();
});

EntrySingleFileLoad.addEventListener('change', () =>{
    if(EntrySingleFileLoad.files.length > 0){
        Filetoprocess = EntrySingleFileLoad.files[0];
        FakeEntrySingleFileLoad.value = Filetoprocess.name;
    } else {
        FakeEntrySingleFileLoad.value = 'No has seleccionado ningun archivo...';
        return;
    }
});

Proceedbutton.addEventListener('click', () =>{
    console.log(Filetoprocess.name);
    if(!Filetoprocess){
        alert("No hay archivos seleccionados")
        return;
    } else {
        if(confirm(`se ha seleccionado un archivo, ¿desea proceder?`)){
            console.log("Sending File..");
        } else{
            console.log("Aborting load..");
            return;
        }
    }
    renderPreview(Filetoprocess);
});

function renderPreview(file) {
    if (!file) {
        console.error("No se proporcionó ningún archivo a la función renderPreview.");
        return;
    }
    const reader = new FileReader();
    reader.onerror = (e) => {
        console.error("Ocurrió un error al leer el archivo:", e);
    };

    // 4. Definimos qué hacer cuando la lectura sea exitosa.
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");

        if (lines.length < 2) {
            alert("El archivo no contiene datos suficientes.");
            return;
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const dta = lines.slice(1).map(line => {
            const values = line.split(",");
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = values[i] ? values[i].trim() : null;
            });
            return obj;
        });
        // console.log(packing);
        Files2Send(dta);
    };
    reader.readAsText(file);
}

async function Files2Send(pack) { //https://ayeseri.onrender.com/ClasifyMethod
    // console.log(typeof(pack), pack);
    try {
        const respuesta = await fetch(`https://supreme-winner-v4j64j4r6vrh99-5001.app.github.dev/ObtainErrorsFN`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pack)
        });
        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        console.log('Archivo enviado con exito');
    } catch (error) {
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}

//--------------------------------------------Error Load------------------------------------------------------------
//--------------------------------------------Password Maintenance------------------------------------------------------------
let SelectedUsers = [];
const TBPSS = document.getElementById('TableItemsPSS');

async function PSS_Maintenance(){
    Window_opc = 3;
    windowadjust();
    fetch(`https://ayeseri.onrender.com/Users`)
    .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
    console.log(data);
        if(data.length == 0){
            document.getElementById('TableItems').style.display = "none";
        }
    printingusers(data);
    })
    .catch(err => {
    console.error("Failed to load users, please review the API Conection or logs", err);
    });
}

function printingusers(data){
    if(data.length === 0){
        alert("No hay usuarios registrados :D")
        return;
    }
    const pasteinformation = document.getElementById('TableItemsPSS');
    const headerinformation = document.getElementById('Tableheaders');
    pasteinformation.innerHTML = '';
    let insertheader = document.createElement('tr');
    insertheader.innerHTML=`
        <th></th>
        <th>User Name</th>
        <th>Email</th>
        <th>Last Update</th>
        <th>Change flag</th>
    `;
    headerinformation.appendChild(insertheader);
    data.forEach(item => {
        let insertline = document.createElement('tr');
        insertline.innerHTML=`
            <td><input class="UserPSSMT" id="PSSCheckbox_${item.id}" type="checkbox" value=${item.id}></td>
            <td class="User" id="User_${item.Username}">${item.Username}</td>
            <td class="Email" id="email_${item.email}">${item.email}</td>
            <td class="PSSUPDAT" id="PSSUPDAT_${item.password_updated_at}">${item.password_updated_at}</td>
            <td class="PSSFlagchange" id="PSSCHFL_${item.PSSFlagchange}">${item.PSSFlagchange}</td>
        `;
        pasteinformation.appendChild(insertline);
    });
}

TableItemsPSS.addEventListener('change', function(event) {
    if (event.target.matches('.UserPSSMT')) {
        const checkbox = event.target;
        const UserID = checkbox.value;
        if (checkbox.checked) {
            const Toprocess = {
                id: UserID,
                pss: "Ayeseri12345."
            };
            SelectedUsers.push(Toprocess);
        } else {
            SelectedUsers = SelectedUsers.filter(user => user.id !== UserID);
        }
        console.log("Tickets seleccionados actualmente:", SelectedUsers);
    }
});

async function ProcessSelectedUsers(){
    if(SelectedUsers.length === 0){
        alert("No Users selected, please select at least one to proceed");
        return;
    }
    console.log("Enviando este cuerpo JSON a la API:", JSON.stringify({ Toprocess:SelectedUsers}, null, 2));
    try {
        const respuesta = await fetch(`https://ayeseri.onrender.com/UpdatePSS`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Toprocess:SelectedUsers }) 
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

//--------------------------------------------Password Maintenance------------------------------------------------------------