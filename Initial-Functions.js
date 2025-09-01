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
document.getElementById("Loginpage").addEventListener("click", Loginpage);

async function test(){
    try {
        const res = await fetch('/api/send-email', {
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
        alert('Error inesperado');
      }
}

async function User_Validation() {
    event.preventDefault();
    // Evita que el formulario se enví
    //TEST line
    
    let inputUser = document.getElementById("Usuario").value;
    let inputpss = document.getElementById("password").value;
    if (! inputUser && ! inputpss) {
        alert('Por favor, rellene todos los campos')
        return;
    } 
    if (! inputUser) {
        alert('Ingrese el correo o nombre de usuario')
        return;
    } 
    if (! inputpss) {
        alert('Ingrese la contraseña')
        return;
    } 
    try {
        //console.log("Debbuging method start")
        const key = await User_search(inputUser, inputpss, 0)
        //console.log(`${key[0]} + ${key[1]}`)
        if (key[0] && key[1]) {
            if(inputUser == 'Admin'){
                alert("Maestro")
            }
            window.open(`../MainPage/Employee-search/Main-page.html?User=${key[2]}`, "_self");
        } else if (!key[0]) {
            alert("El usuario no existe");} 
        else {
            alert("Contraseña es incorrecta, por favor veifica la entrada");}
    } catch (err) {
      console.error("Error inesperado en validación:", err);
      alert("Ocurrió un error inesperado. Intenta de nuevo.");
    }
}

async function User_search(usertofind, passw, opc){
    const key = [];
    try{
        const response = await fetch(`https://ayeseri.onrender.com/Users`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No hay usuarios en la base');
            } else {
                console.error('Error 455', response.statusText);//Error peticion
            }
            return null;
        }
        const data = await response.json();
        //console.log(data);
        if(opc == 0){
            key.push(false, false);
            for (const Obj of data){
                if((Obj.Email === usertofind) || (Obj.Username === usertofind)){
                    key[0] = true;
                    key.push(Obj.Username);
                    //console.log(key[0]);
                }
                if((Obj.Password === passw && key[0])){
                    key[1] = true;
                    //console.log(key[0]);
                }
            }
            //console.log(key);
            return key;
        }
        if(opc == 1){
            key.push(0);
            for (const Obj of data){
                if(Obj.Username === usertofind){
                    key[0] = 1;
                    break;
                }
            }
            return key;
        }
    } catch (error) {
        console.error('Error de conexion 468', error);//error de conexion con la API
        return null;
    }

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

async function SendRequest(){
    
    const fields = [
        { input: '#NoTicket', label: '#NoTicketlbl', msg: 'Coloca el número de ticket.' },
        { input: '#Username', label: '#Usernamelb',  msg: 'Se necesita nombre de usuario.' },
        { input: '#Email',    label: '#Emaillb',     msg: 'Coloca el email.' },
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
    let Userexist = await User_search(values['#Username'], 'NA', 1);
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
    // try {
    //     const response = await fetch(`https://ayeseri.onrender.com/Requests/${values['#NoTicket']}/${values['#Username']}/${values['#Email']}/${values['#PSS']}`);
    //     if (!response.ok) {
    //         if (response.status === 404) {
    //             console.log('Revisar conexion');
    //         } else {
    //             console.error('Error 455', response.statusText);//Error peticion
    //         }
    //         return null;
    //     }
    // } catch (error) {
    //     console.error('Error de conexion 468', error);//error de conexion con la API
    //     return null;
    // }
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
        console.log(data);
        for (const Obj of data){
                console.log(`${Obj.Noticket} == ${tickettoval}`);
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