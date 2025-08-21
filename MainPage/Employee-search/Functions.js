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

const HELP_ROUTE = "../Help";
let SELECTION = "X";
let TIME_SELECTION = "Today";
let Prevsel= null;
const Validroutes = ["0000", "0001", "0002", "0006", "0007", "0008", "0014", "0015", "NITR", "Others"];
const TimeParameters = [{TID: 0, Label: "From current date", URLtime: "FRMCrDate"}, 
                        {TID: 1, Label: "Last month", URLtime: "LstMonth"}, 
                        {TID: 2, Label: "Last week", URLtime: "LstWeek"},
                        {TID: 3, Label: "Today", URLtime: "Today"},
                        {TID: 4, Label: "Current Week", URLtime: "CrrWeek"}, 
                        {TID: 5, Label: "Current Month", URLtime: "CrrMonth"},
                        {TID: 6, Label: "Current Year", URLtime: "CrrYear"},
                        {TID: 7, Label: "To current date", URLtime: "ToCrrDate"}, 
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
        window.location.href = `../Overview/Errorsview.html?IT=${SELECTION}&ID=${id}`;
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
