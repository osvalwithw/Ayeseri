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

//import {Email_send} from '../../Initial-Functions.js';

const HELP_ROUTE = "../Help";
let SELECTION = "X";
let TIME_SELECTION = "Today";
let Prevsel= null;
const Validroutes = ["0000", "0001", "0002", "0006", "0007", "0008", "0014", "0015", "NITR", "Others"];
const TimeParameters = [{TID: 0, Label: "To current date", URLtime: "ToCrrDate"}, 
                        {TID: 1, Label: "Last month", URLtime: "LstMonth"}, 
                        {TID: 2, Label: "Last week", URLtime: "LstWeek"},
                        {TID: 3, Label: "Today", URLtime: "Today"},
                        {TID: 4, Label: "Current Week", URLtime: "CrrWeek"}, 
                        {TID: 5, Label: "Current Month", URLtime: "CrrMonth"},
                        {TID: 6, Label: "Current Year", URLtime: "CrrYear"},
                        {TID: 7, Label: "From current date", URLtime: "FRMCrDate"}, 
                        {TID: 8, Label: "All", URLtime: "All"},
                    ];

document.addEventListener("keydown", (event) =>{
    if(event.key === "Enter"){
        let directsearch = document.getElementById('DirInput').value;
        if(Validroutes.includes(directsearch)){
            ITSelection(directsearch);
        } else {
            alert("Revisa la entrada 'Type Infotype'")
        }
    }    
});

const Timeadjust = document.getElementById('timeSelection'); //Selection
const Timeadjustlbl = document.getElementById('Timeopc');      //Label
Timeadjust.addEventListener("input", () =>{
    let Timelbl = TimeParameters[Timeadjust.value].Label;
    Timeadjustlbl.innerText = `${Timelbl}`;
    TIME_SELECTION = TimeParameters[Timeadjust.value].URLtime;
    console.log(`${TIME_SELECTION}`)
});

// Cierra la conexión

function search_EE(){
    if(SELECTION == "X"){
        alert("Por favor Seleccione un infotipo")
        return
    }
    let cadena = document.getElementById("Personnel_Nmb").value;
    if(!cadena) {
        alert("Por favor rellene el campo 'Personel number'")
        return
    }
    
    buscarPorID_EE(cadena);
}

async function buscarPorID_EE(id) {
    try {
        const response = await fetch(`https://ayeseri.onrender.com/employee_errors/${id}/${TIME_SELECTION}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log('❗ No se encontró ningún registro con ese ID_EE');
                alert("No se encontró ningún registro con ese numero de empleado")
            } else {
                console.error('❌ Error en la petición:', response.statusText);
            }
            return null;
        }
        const data = await response.json();
        console.log('✅ Resultado encontrado:', data);
        window.location.href = `../Overview/Errorsview.html?ID=${id}&IT=${SELECTION}&Timepar=${TIME_SELECTION}`;
        return data;
    } catch (error) {
        console.error('❌ Error al conectar con la API:', error);
        return null;
    }
}

function help() {
    if(SELECTION == "X"){
        alert("Por favor Seleccione un infotipo")
        return
    }
    let halfroute;
    if(Validroutes.includes(SELECTION)){
        console.log(SELECTION)
        halfroute = `/${SELECTION}.html`; 
    }
    let fullroute = HELP_ROUTE + halfroute
    console.log(fullroute)
    window.open(
    fullroute,
    "_blank",
    "width=600,height=400,top=100,left=100, toolbar=no,scrollbars=yes,resizable=no");
}

function ITSelection(ITVAL){
    let ITSelection = `IT${ITVAL}`;
    let tittlechange = document.getElementById('InfMainTittlelbl');
    let highlight_help = document.getElementById('helpbutton');
    highlight_help.style.background = "rgb(1, 53, 106)";
    highlight_help.addEventListener("mouseover", () =>{
        highlight_help.style.background = "rgb(16, 90, 119)";
    });
    highlight_help.addEventListener("mouseout", () =>{
        highlight_help.style.background = "rgb(1, 53, 106)";
    });
    tittlechange.innerText = `Infotype`;
    if(Prevsel){
        let Prevselection = document.querySelector(`.${Prevsel}`);
        Prevselection.style.border = "none";
        Prevselection.style.background = "rgba(255, 255, 255, 0.3)";
    }
    Prevsel = ITSelection;
    SELECTION = ITVAL; //to select infotype
    let actualselection = document.querySelector(`.${ITSelection}`);
    actualselection.style.border = "4px solid white";
    actualselection.style.background = "rgba(1, 53, 106, .3)";
    //tittlechange.innerText += ` ${SELECTION}`;
    const Tittlefields = [
        { IT: '0000', Message: 'Actions'},
        { IT: '0001', Message: 'Organizational Assignment'},
        { IT: '0002', Message: 'Personal Data'},
        { IT: '0006', Message: 'Addresses'},
        { IT: '0007', Message: 'Planned Working Time'},
        { IT: '0008', Message: 'Basic Pay'},
        { IT: '0014', Message: 'Recurring Payments/Deductions'},
        { IT: '0015', Message: 'Additional Payments'},
        { IT: 'NITR', Message: 'No Infotype related'},
        { IT: 'Others', Message: 'Others'},
    ]
    for ({IT, Message} of Tittlefields){
        if(IT === 'Others'){
            tittlechange.innerText += ` ${SELECTION}`;
            break;
        }
        if (SELECTION === IT){ 
            FullMSG =` ${IT} ${Message}`;
            tittlechange.innerText += `${FullMSG}`;
            break;
        }
    }
}

function show_report_register(RPTopc){
    if(RPTopc === 0){
        document.getElementById("report-section").style.display = "block";
    } else{
        document.getElementById("report-section").style.display = "none";
    }
    
}

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
        if (!res.ok) {
        alert(`Error: ${data.error}`);
        }
      } catch (e) {
        console.error(e);
        alert('Error inesperado, intentelo mas tarde');
        return 404;
      }
}

function Report_send(){
    const params = new URLSearchParams(window.location.search);
    const Userinvolved = params.get('User');
    const adminemail = 'osvaldoml2010@hotmail.com';
    let report_header = document.getElementById('rptquestion_input').value;
    let report_time = document.getElementById('rptdate_input').value;
    let report_details = document.getElementById('rptdetails_input').value;
    Report_subject = `Reporte ${report_header} por ${Userinvolved}`;
    Report_content = `Un nuevo reporte acaba de llegar de parte de ${Userinvolved} el cual fue enviado el
                      ${report_time}, con las siguientes inquietudes:

                      ${report_details}

                      Por favor, recuerda dar seguimiento no mas de 7 dias despues de recibir este correo.`;
    ReporEmail = Email_send(adminemail, Report_subject, Report_content);
    if(ReporEmail === 404){
        alert("No fue posible enviar el correo..");
        console.log(err);
    } else {
        alert("Reporte enviado con exito!.")
    }
}



const chat = document.getElementById('User_chat');
const form = document.getElementById('chat-form');
const ta = document.getElementById('User_msg');

const autoresize = (el) => {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};
ta.addEventListener('input', () => autoresize(ta));

function addMessage(text, who = 'me') {
  const box = document.createElement('div');
  box.className = `msg ${who}`;
  box.innerHTML = `${text}<span class="time">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>`;
  chat.appendChild(box);
  chat.scrollTop = chat.scrollHeight;
}

function Sendmessage(){
    console.log("si llega aca");
    const text = ta.value.trim();
    if (!text) return;

    addMessage(text, 'me');
    ta.value = '';
    setTimeout(() => {
    addMessage('Recibido ✅. Estoy procesando tu solicitud...', 'bot');
    }, 500);
}

addMessage('¿Necesitas ayuda con algo? :-)', 'bot');
