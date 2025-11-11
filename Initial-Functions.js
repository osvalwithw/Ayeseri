//innerHTML: Cambia el elemento por completo
//innertext: Cambia el contenido
//Document.write: Puede borrar todo el contenido si se le llama despues de cargar una pagina
//window.alert: Manda unaventana emergente
//console.log: para debug

//let es mas reciente que var. const no se puede modificar por ningun medio, block scope significa que lo que este declarado dentro o fuera de un bloque no es lo mismo
//Se leen las variables de izquiera a derecha

//Se puede acceder a los elementos de un objeto usando person.lastName;, person["lastname"] o x = lastname; person[x]
//this hace referencia al objeto en cuestion
//Se pueden anidar objetos, respetando las mismas llamadas anteriores

//EL directorio root de la API es API-server



async function envio_test(){
    console.log("Enviando correo de prueba...");
    try {
        const res = await fetch('https://ayeseri.onrender.com/Emails/SendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'osvaldoml2010@hotmail.com',
            subject: 'Prueba desde frontend',
            message: '¡Hola Oswaldo! Este correo salió al presionar un botón 😺'
          })
        });
 
        const data = await res.json();
        if (res.ok) {
          alert(`Correo enviado a ${data.sent_to}`);
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (e) {
        console.error(e);
        alert('Error inesperado, intentelo mas tarde');
      }
}

function salvavidas(){
    alert("¡Salvavidas activado! 🚀");
    window.open(`../MainPage/AdminSpace/Adminpge.html?User=Admin`, "_self");
}

async function User_Validation() {
    let adminkey = 0;
    console.log("Validando usuario...");
    const inputUser = document.getElementById("Usuario").value?.trim();
    const inputpss  = document.getElementById("password").value;

    if (!inputUser || !inputpss) {// 
        alert('Por favor, rellena usuario y contraseña');
        return;
    }

    try {
        const resp = await User_search(inputUser, inputpss);
        console.log("Respuesta de la API:", resp);
        // console.log("Usuario ID:");
        // console.log("Usuario ingresado:", resp.user?.username);
        // console.log("Rol del usuario:", resp.user?.role);
        if (resp?.ok) {
            const username = resp.user?.username ?? inputUser;
            const role = resp.user?.role;
            // console.log("Usuario validado:", username, "con rol:", role);
            if (role === 2) {
                window.open(`../MainPage/AdminSpace/Adminpge.html?User=${encodeURIComponent(username)}&RL=${encodeURIComponent(role)}`, "_self");
            } else {
                window.open(`../MainPage/Employee-search/Main-page.html?User=${encodeURIComponent(username)}&RL=${encodeURIComponent(role)}`, "_self");
            }
            return;
        }

        if (resp?.reason === 'not-found') {
            alert("El usuario no existe");
        } else if (resp?.reason === 'bad-credentials') {
          alert("Contraseña incorrecta, por favor verifica");
        } else {
           alert("Error al iniciar sesión. Intenta de nuevo.");
        }
    } catch (err) { 
        console.error("Error inesperado en validación:", err);
        alert("Ocurrió un error inesperado. Intenta de nuevo.");
    }
}


async function User_search(usertofind, passw) {
  const API = 'https://ayeseri.onrender.com';
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usertofind);
  const payload = isEmail ? { email: usertofind, password: passw }
                          : { username: usertofind, password: passw };
  const res = await fetch(`${API}/LoginUser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)});
  if (res.ok) {
    return await res.json(); // { ok, user:{...} }
  }
  if (res.status === 401) return { ok: false, reason: 'bad-credentials' };
  if (res.status === 404) return { ok: false, reason: 'not-found' };
  return { ok: false, reason: 'server-error' };
}



function CreateAccount(){
    //window.open('../MainPage/RegisterMenu/MenuView.html', "_blank", 
    //    "width=600,height=400,top=100,left=100, toolbar=no,scrollbars=yes,resizable=no");
    document.getElementById("glass-container").style.display = "none";
    document.getElementById("Register-box").style.display = "block";
}

function Loginpage(){
    //window.open('../MainPage/RegisterMenu/MenuView.html', "_blank", 
    //    "width=600,height=400,top=100,left=100, toolbar=no,scrollbars=yes,resizable=no");
    document.getElementById("glass-container").style.display = "block";
    document.getElementById("Register-box").style.display = "none";
}

async function Usercreated(Username){
    const API = 'https://ayeseri.onrender.com';
    try{
        const response = await fetch(`${API}/Users`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Revisar conexion');
                } else {
                    console.error('Error 455', response.statusText);//Error peticion
                }
                return null;
            }
        const data = await response.json();
        // console.log(data);
        for (const Obj of data){
                // console.log(`${Obj.Username} == ${Username}`);
                if((Obj.Username === Username)){
                    return 1;
                }
            }
        return 0;
    } catch (error) {
            console.error('Error de conexion 468', error);//error de conexion con la API
            return null;
        }
}

// async function SendRequest(){
document.querySelector('#sendbutton').addEventListener('click', async (e) => {
    e.preventDefault();   
    const fields = [
        { input: '#NoTicket', label: '#NoTicketlbl', msg: 'Coloca el número de ticket.' },
        { input: '#Username', label: '#Usernamelb',  msg: 'Se necesita nombre de usuario.' },
        { input: '#Email',    label: '#Emaillb',     msg: 'ingresa el correo electronico.' },
        { input: '#PSS',      label: '#passwordlb',  msg: 'Coloca la contraseña.' },
        { input: '#RPTPSS',   label: '#RPTPSSlb',    msg: 'Repite la contraseña.' },
    ];

    const errors = [];
    let firstInvalid = null;
    const values = {};

    // Reset visual
    fields.forEach(({label}) => {
        const lbl = document.querySelector(label);
        if (lbl) lbl.style.color = 'black';
    });

    for (const { input, label, msg } of fields) {
        const el  = document.querySelector(input);
        const lbl = document.querySelector(label);
        const val = (el?.value || '').trim();

        values[input] = val;
        //console.log(values);
        const invalid = !val;

        if (lbl) lbl.style.color = invalid ? 'red' : 'black';
        if (invalid) {
        if (!firstInvalid) firstInvalid = el;
        errors.push(`• ${msg}`);
        }
    }

    let ticket = values['#NoTicket'];
    if (ticket && !ticket.startsWith('RITM')) {
        errors.push('• El número de ticket debe empezar con "RITM".');
        const lbl = document.querySelector('#NoTicketlbl');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#NoTicket');
    }

    let Userexist = await Usercreated(values['#Username']);
    
    if(Userexist == 1){
        errors.push('• El nombre de usuario ya existe');
        const lbl = document.querySelector('#Usernamelb');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#Username');
    }

    let avar = await Ticketval(ticket);

    if(avar == 1){
        errors.push('• Ya existe un numero de ticket registrado, ingresa uno nuevo');
        const lbl = document.querySelector('#NoTicketlbl');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#NoTicket');
    }

    if (values['#Email']) {
        const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicEmail.test(values['#Email'])) {
        errors.push('• El email no tiene un formato válido.');
        const lbl = document.querySelector('#Emaillb');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#Email');
        }
    }

    const pass = values['#PSS'];
    const rpass = values['#RPTPSS'];
    if (pass && rpass && pass !== rpass) {
        errors.push('• Las contraseñas no coinciden.');
        const pl = document.querySelector('#passwordlb');
        const rl = document.querySelector('#RPTPSSlb');
        if (pl) pl.style.color = 'red';
        if (rl) rl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#RPTPSS');
    }

    if (errors.length) {
        if (firstInvalid) firstInvalid.focus();
        alert(errors.join('\n'));
        setTimeout(() => {
        fields.forEach(({label}) => {
        const lbl = document.querySelector(label);
        if (lbl) lbl.style.color = 'black';
        });}, 5000);
        return false;
    } 
    console.log("ok");
    yousure = confirm("¿Estás seguro de enviar la solicitud con estos datos?");
    if (!yousure) {
        return false;
    }
    Ticket_email();
    // console.log(`Enviando datos ${values['#NoTicket']}, ${values['#Username']}, ${values['#Email']}, ${values['#PSS']}`);
    // await upload_inDB(values['#NoTicket'], values['#Username'], values['#Email'], values['#PSS']);
    validation = await upload_inDB(values['#NoTicket'], values['#Username'], values['#Email'], values['#PSS']);

});

async function upload_inDB(NoTicket, Username, Email, PSS) {
    try {
        const response = await fetch(`https://ayeseri.onrender.com/NewRequests/${NoTicket}/${Username}/${Email}/${PSS}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Revisar conexion');
            } else {
                console.error('Error 455', response.statusText);//Error peticion
            }
            return null;
        }
        const data = await response.json();
        alert('Solicitud registrada con exito, en breve recibira un correo de confirmacion.');
        return data;
    } catch (error) {
        console.error('Error de conexion 468', error);//error de conexion con la API
        return null;
    }
}

async function Ticketval(tickettoval){
    key = 0;
    try{
        const response = await fetch(`https://ayeseri.onrender.com/Requests`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Revisar conexion');
            } else {
                console.error('Error 455', response.statusText);//Error peticion
            }
            console.error("Revisa la informacion del ticket y el usuario");
            return null;
        }
        const data = await response.json();
        // console.log(data);
        for (const Obj of data){
                // console.log(`${Obj.Noticket} == ${tickettoval}`);
                if((Obj.NoTicket === tickettoval)){
                    key = 1;
                }
            }
        return key;
    } catch(error){
        console.error('Error de conexion 468', error);//error de conexion con la API
        return null;
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------
async function Email_send(dest, asun, mensj){ 
    try {
        const res = await fetch('https://ayeseri.onrender.com/Emails/SendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: dest,
            subject: asun,
            message: mensj
          })
        });
 
        const data = await res.json();
        if (res.ok) {
          alert(`Correo enviado a ${data.sent_to}`);
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (e) {
        console.error(e);
        alert('Error inesperado, intentelo mas tarde');
        return 404;
      }
}
//---------------------------------------------------------------------------------------------------------------------------------------

//Enviar correo al registrar ticket
async function Ticket_email(){
    //const params = new URLSearchParams(window.location.search);
    //const actualuser = params.get('User');
    let Emailtosend = document.getElementById('Email').value;
    let usercreated = document.getElementById('Username').value;
    let Ticket = document.getElementById('NoTicket').value;
    ticket_subject = `Registro de solicitud número ${Ticket}`;
    ticket_message = `Usted acaba de solicitar una nueva cuenta de usuario en Ayeseri con la siguiente informacion:

                        Numero de ticket:   ${Ticket}
                        Nombre de usuario:  ${usercreated}
                        Correo asociado:    ${Emailtosend}
                        Contraseña:         Anotada por el usuario :)

                    Si necesita corregir informacion antes de proceder, acude con el administrador a la brevedad antes de las 10 AM hora del pacifico.

                    Muchas gracias y que tengas buen dia!. :D
    `;
    Useremail = Email_send(Emailtosend, ticket_subject, ticket_message);
}

//---------------------------------------------------------------------------------------------------------------------------------------

const PSSbox = document.getElementById("PSSbutton");

PSSbox.addEventListener("click", (e) =>{
    e.preventDefault();
    document.getElementById("Missingpassword").style.display = "block";
});

function closePSSbox(){
    document.getElementById("Missingpassword").style.display = "none";
}