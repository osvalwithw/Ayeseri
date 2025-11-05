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
//--------------------------------------------Window Adjustment------------------------------------------------------------
const AdminUserviewBtn = document.getElementById('Userview');

AdminUserviewBtn.addEventListener('click', () =>{
    Window_opc = 0;
    windowadjust();
    fetch(`../Employee-search/Main-page.html`).then(res => {
        if (!res.ok) throw new Error('Please review API Connection');
            return res.text();
    })
    .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
 
         // Carga los estilos de esa página (si los hay)
        const estilos = doc.querySelectorAll('link[rel="stylesheet"]');
        estilos.forEach(link => {
        if (!document.querySelector(`link[href="${link.href}"]`)) {
            document.head.appendChild(link.cloneNode(true));
        }});
        document.getElementById('AdminUsersview').innerHTML = data;
    })
    .catch(err => {
    console.error("Failed to load Employee Search Page, please review the API Conection or logs", err);
    });
});



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
        FakeEntrySingleFileLoad.value = "C:Fakepath/" + Filetoprocess.name;
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
        const normalizedData = e => e.normalize


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
const TBPSSHD = document.getElementById('TableheadersPSS');

async function PSS_Maintenance(){
    Window_opc = 3;
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
        <th></th>
        <th>User Name</th>
        <th>Email</th>
        <th>Last Update</th>
        <th>Change PSS flag</th>
    `;
    headerinformation.appendChild(insertheader);
    data.forEach(item => {
        let insertline = document.createElement('tr');
        insertline.innerHTML=`
            <td><input class="UserPSSMT" id="PSSCheckbox_${item.id}" type="checkbox" value=${item.id}></td>
            <td class="User" id="User_${item.Username}">${item.Username}</td>
            <td class="Email" id="email_${item.email}">${item.email}</td>
            <td class="PSSUPDAT" id="PSSUPDAT_${item.password_updated_at}">${item.password_updated_at}</td>
            <td class="PSSFlagchange" id="PSSCHFL_${item.PSSFlagchange} style="text-align: center;">${item.PSSFlagchange}</td>
        `;
        pasteinformation.appendChild(insertline);
    });
}

TableItemsPSS.addEventListener('change', function(event) {
    if (event.target.matches('.UserPSSMT')) {
        const checkbox = event.target;
        const UserID = checkbox.value;
        if (checkbox.checked) {
            const fila = checkbox.closest('tr');
            const changeflag = fila.querySelector('.PSSFlagchange').textContent;
            if(changeflag === "1"){
                alert("Este usuario ya fue procesado previamente.");
                checkbox.checked = false;
                return;
            }
            const Toprocess = {
                id: UserID,
                pss: "Ayeseri12345."
            };
            SelectedUsers.push(Toprocess);
        } else {
            SelectedUsers = SelectedUsers.filter(user => user.id !== UserID);
        }
        console.log("Usuarios seleccionados actualmente:", SelectedUsers);
    }
});

async function ProcessSelectedUsers(){
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
        SelectedUsers = [];
    } catch (error) {
        console.error('Error al enviar los datos a la API:', error);
        alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo.');
    }
}

//--------------------------------------------Password Maintenance------------------------------------------------------------