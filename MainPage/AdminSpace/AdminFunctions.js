let Window_opc = 0; // 0: None, 1: Errors, 2: User Creation, 3: PSS Maintenance
const windows = [
    document.getElementById("AdminUsersview"),
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

const params = new URLSearchParams(window.location.search);
const Userload = params.get('User');
const alertmessage = document.getElementById('Alertscontainer');
//--------------------------------------------User view method------------------------------------------------------------
const AdminUserviewBtn = document.getElementById('Userview');
let windowopen = null

AdminUserviewBtn.addEventListener('click', () =>{
    Window_opc = 0;
    windowadjust();
});

function Openuserview(){
    let labelusv = document.getElementById('UserviewIsopen');
    if(windowopen && !windowopen.closed){
        alert("Hay una ventana que esta abierta, cierrala primero antes de abrir otra");
        windowopen.focus();
    } else {
        const params = new URLSearchParams(window.location.search);
        const username = params.get('User');
        const role = params.get('RL');
        windowopen = window.open(`../Employee-search/Main-page.html?User=${encodeURIComponent(username)}&RL=${encodeURIComponent(role)}`, "_blank");
    }
}

//--------------------------------------------User Info View------------------------------------------------------------
const UserInfoBtn = document.getElementById('UserInfoBTN');
const UserInfoExitBtn = document.getElementById('USexitbtn');
const ConfirmPSSchange = document.getElementById('UpdatePSSBTN');

UserInfoBtn.addEventListener('click', () =>{
    let pssflag = 0;
    const params = new URLSearchParams(window.location.search);
    const Loggeduser = params.get('User');
    document.getElementById("UserInformationView").style.display = 'block';
    fetch(`https://ayeseri.onrender.com/SingleUser/${Loggeduser}`)
    .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
        pssflag = data[0].PSSFlagchange;
        document.getElementById('UsernameField').value = `${data[0].Username}`;
        document.getElementById('UserEmailField').value = `${data[0].email}`;
        document.getElementById('UserRoleField').value = `${data[0].UserRole}`;
        // document.getElementById('PSSStatusField').value = `${data[0].PSSFlagchange}`;
        if(pssflag == 1){
            document.getElementById('PSSheader').style.display = 'flex';
        }
    })
    .catch(err => {
    console.error("Failed to load user, please review the API Conection or logs", err);
    });
    windowadjust();
});

UserInfoExitBtn.addEventListener('click', () =>{
    document.getElementById("UserInformationView").style.display = 'none';
    windowadjust();
});

UpdatePSSBTN.addEventListener('click', () =>{
    const newpss = document.getElementById('NewPSSField').value;
    const repeatpss = document.getElementById('RepeatPSSField').value;
    const params = new URLSearchParams(window.location.search);
    console.log("New PSS:", newpss, "Repeat PSS:", repeatpss);
    if(newpss === "" || repeatpss === ""){
        alert("Ambos campos de contraseña deben ser llenados.");
        return;
    }
    if(newpss !== repeatpss){
        alert("Las contraseñas no coinciden, por favor intente de nuevo.");
        return;
    }
    if(newpss.length < 8){
        alert("La contraseña debe tener al menos 8 caracteres.");
        return;
    }
    const Loggeduser = params.get('User');
    fetch(`https://ayeseri.onrender.com/UpdateSinglePSS`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            Username: Loggeduser,
            NewPSS: newpss,
            PSSFlagchange: 0
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
        alert("Contraseña actualizada correctamente!.");
    })
    .catch(err => {
    console.error("Failed to update password, please review the API Conection or logs", err);
    });
});
//--------------------------------------------User Info View------------------------------------------------------------
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
    headerinformation.innerHTML = '';
    let insertheader = document.createElement('tr');
    insertheader.innerHTML=`
        <th></th>
        <th>Ticket Number</th>
        <th>User Name</th>
        <th>Email</th>
        <th>Password</th>
        <th>Upload Time</th>
        <th>Role Assigned</th>
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
            <td><select class=Rolselection id=Selection_${item.id}>
                <option value="1">1 - Usuario</option>
                <option value="2">2 - Administrador</option>
            </td>
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
            const role = fila.querySelector('.Rolselection').value;
            const infoTicket = {
                id: ticketId,
                usuario: usuario,
                email: email,
                pss: pss,
                role: role
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
    fetchLastLoadInfo();
}

const FakeEntrySingleFileLoad = document.getElementById('FakeSingleLoad');
const EntrySingleFileLoad = document.getElementById('SingleLoad');
const ButtonSingleFileLoad = document.getElementById('BTNSingleLoad');
const EntryMultipleFileLoad = document.getElementById('MultipleLoad');
const ButtonMultiplleFileLoad = document.getElementById('BTNMultipleLoad');
const Proceedbutton = document.getElementById('ConfirmLoad');
const LastLoadOn = document.getElementById('Lastload');
const LastLoadBy = document.getElementById('Lastloadby');
let Filetoprocess = "";

// Fetch last load info
async function fetchLastLoadInfo() {
    fetch(`https://ayeseri.onrender.com/lastload`)
        .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
        })
        .then(data => {
        // console.log(data['Username']);
        if(data.length == 0){
            LastLoadOn.textContent = "No previous loads found";
            LastLoadBy.textContent = "N/A";
            return;
        }
        LastLoadOn.textContent = data['DTALASTLOAD'];
        LastLoadBy.textContent = data['Username'];
        })
        .catch(err => {
        console.error("Failed to load last load info, please review the API Conection or logs", err);
    });
}

ButtonSingleFileLoad.addEventListener('click',() =>{
    EntrySingleFileLoad.value = '';
    EntrySingleFileLoad.click();
});

EntrySingleFileLoad.addEventListener('change', () =>{
    if(EntrySingleFileLoad.files.length > 0){
        Filetoprocess = EntrySingleFileLoad.files[0];
        FakeEntrySingleFileLoad.value = 'C:Fakepath/' + Filetoprocess.name;
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

    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");

        if (lines.length < 2) {
            alert("El archivo no contiene datos suficientes.");
            return;
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const dta = lines.slice(1).map(line => {
            // dta[['Loadedby']] = Userload;
            const values = line.split(",");
            const obj = {['Loadedby']: Userload};
            headers.forEach((h, i) => {
                if(obj)
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
    // console.log("Usuario que carga el archivo:", Userload);
    // console.log("Paquete a enviar:", pack);
    // console.log("Enviando este cuerpo JSON a la API:", JSON.stringify(pack, null, 2));
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
//--------------------------------------------User Maintenance------------------------------------------------------------

let SelectedUsers = [];
const TBPSS = document.getElementById('TableItemsPSS');
const TBPSSHD = document.getElementById('TableheadersPSS');

async function PSS_Maintenance(){
    Window_opc = 3;
    alertmessage.innerHTML = '';
    windowadjust();
    TBPSS.innerHTML = '';
    TBPSSHD.innerHTML = '';
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
    const headerinformation = document.getElementById('TableheadersPSS');
    pasteinformation.innerHTML = '';
    let insertheader = document.createElement('tr');
    insertheader.innerHTML=`
    <div>
        <th></th>
        <th>User Name</th>
        <th>Email</th>
        <th>Last Update</th>
        <th>Change PSS flag</th>
        <th>Role Assigned</th>
    </div>
    `;
    headerinformation.appendChild(insertheader);
    data.forEach(item => {
        let insertline = document.createElement('tr');
        let formatdate = new Date(item.password_updated_at);
        let day = String(formatdate.getDate()).padStart(2, '0');
        let month = String(formatdate.getMonth() + 1).padStart(2, '0');
        let year = formatdate.getFullYear();
        let formattedDate = `${day}-${month}-${year}`;
        let time = formatdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        if(item.UserRole === 1){
            roleassigned = "Usuario";
        } else if (item.UserRole === 2){
            roleassigned = "Administrador";
        }
        if(item.PSSFlagchange === 1){
            pssstatus = "Requiere cambio";
        } else {
            pssstatus = "No requiere cambio";
        }
        insertline.innerHTML=`
            <div id="UserRow_${item.id}">
                <td><input class="UserPSSMT" id="PSSCheckbox_${item.id}" type="checkbox" value=${item.id}></td>
                <td class="User" id="User_${item.Username}">${item.Username}</td>
                <td class="Email" id="email_${item.email}">${item.email}</td>
                <td class="PSSUPDAT" id="PSSUPDAT_${item.password_updated_at}">${formattedDate} AT ${time}</td>
                <td class="PSSFlagchange" id="PSSCHFL_${item.PSSFlagchange} style="text-align: center;">${pssstatus}</td>
                <td class="RoleAssigned" id="RoleASS_${item.UserRole}">
                <select class=Rolselection id=Selection_${item.id}>
                    <option value="1">1 - Usuario</option>
                    <option value="2">2 - Administrador</option>
                </td>
            </div>
        `;
        let roleSelect = insertline.querySelector('.Rolselection');
        roleSelect.value = item.UserRole;
        pasteinformation.appendChild(insertline);
    });
}

TableItemsPSS.addEventListener('change', function(event) {
    if (event.target.matches('.UserPSSMT')) {
        const checkbox = event.target;
        const UserID = checkbox.value;
        if (checkbox.checked) {
            const fila = checkbox.closest('tr');
            const usuario = fila.querySelector('.User').textContent;
            const changeflag = fila.querySelector('.PSSFlagchange').textContent;
            const roleSelect = fila.querySelector('.Rolselection').value;
            // if(changeflag === "1"){
            //     alert("Este usuario ya fue procesado previamente.");
            //     checkbox.checked = false;
            //     return;
            // }
            const Toprocess = {
                id: UserID,
                username: usuario,
                pss: "Ayeseri12345.",
                role: roleSelect,
                PSSFlagchange: changeflag
            };
            SelectedUsers.push(Toprocess);
        } else {
            SelectedUsers = SelectedUsers.filter(user => user.id !== UserID);
        }
        // console.log("Usuarios seleccionados actualmente:", SelectedUsers);
    }
});

async function ProcessSelectedUsers(){
    let insertalert = document.createElement('ul');
    alertmessage.innerHTML = '';
    SelectedUsers.forEach(element => {
        if(element.PSSFlagchange === "Requiere cambio"){
            SelectedUsers = SelectedUsers.filter(user => user.id !== element.id);
            let row = document.getElementById(`PSSCheckbox_${element.id}`);
            row.checked = false;
            insertalert.innerHTML += `
                <li>El usuario "${element.username}" ya requiere un cambio de contraseña, por lo que no será procesado nuevamente.</li>
            `;
        }
        delete element.PSSFlagchange;
        delete element.username;
        delete element.role;
    }); 
    alertmessage.appendChild(insertalert);
    console.log("Usuarios", SelectedUsers);
    if(SelectedUsers.length === 0){
        alert("No hay usuarios seleccionados, por favor seleccione al menos uno para continuar");
        return;
    }
    confirmation = confirm(`Estas seguro de querer resetear la contraseña a ${SelectedUsers.length} usuario(s)?`);
    if(!confirmation){
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
        alert('Las contraseñas se actualizaron correctamente.');
        SelectedUsers.forEach(element => {
            let row = document.getElementById(`PSSCheckbox_${element.id}`);
            row.checked = false;
        });      
        SelectedUsers = [];
    } catch (error) {
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}

async function ChangeSelectedUsersRole(){
    if(SelectedUsers.length === 0){
        alert("No hay usuarios seleccionados, por favor seleccione al menos uno para continuar");
        return;
    }
    SelectedUsers.forEach(element => {
        delete element.pss;
        delete element.PSSFlagchange;
        delete element.username;
        let rolselection = document.getElementById(`Selection_${element.id}`).value;
        element.role = parseInt(rolselection);
    }); 
    // console.log("Usuarios", SelectedUsers);
    // console.log("Enviando este cuerpo JSON a la API:", JSON.stringify(SelectedUsers, null, 2));
    confirmation = confirm(`Estas seguro de querer cambiar el rol a ${SelectedUsers.length} usuario(s)?`);
    if(!confirmation){
        return;
    }
    try {
        const respuesta = await fetch(`https://ayeseri.onrender.com/ChangeUserRole`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(SelectedUsers, null, 2) 
        });
        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }
        const datosRespuesta = await respuesta.json();
        console.log('Éxito! Respuesta del servidor:', datosRespuesta);
        alert('Los roles se actualizaron correctamente.');
        SelectedUsers.forEach(element => {
            let row = document.getElementById(`PSSCheckbox_${element.id}`);
            row.checked = false;
        });    
        SelectedUsers = [];
    } catch (error) {
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}   

//--------------------------------------------User Maintenance------------------------------------------------------------