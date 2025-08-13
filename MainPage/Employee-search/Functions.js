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

const HELP_ROUTE = "./Help windows"
let SELECTION = "X"

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
        const response = await fetch(`https://ayeseri.onrender.com/employee_errors/${id}`);
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
        window.location.href = `/Overview/Errorsview.html?IT=${SELECTION}&ID=${id}`;
        return data;
    } catch (error) {
        console.error('❌ Error al conectar con la API:', error);
        return null;
    }
}


function extrae() {
    event.preventDefault();
    // Evita que el formulario se enví
    //TEST line
    
    let inputNombre = document.getElementById("Usuario").value;
    let inputpss = document.getElementById("password").value;
    if (! inputNombre && ! inputpss) {
        alert('Todo esta vacio, es usted imbecil?')
    } else if (! inputNombre) {
        alert('como se llama?? :))))')
    } else if (! inputpss) {
        alert('Contraseñaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?')
    } else {
        window.open("./MainPage/Employee-search/Main-page.html", "_self",)
    }
}

function help(towork) {
    let halfroute;
    if (towork == 0) {
        halfroute = "/0000 help.html"
    } else if (towork == 1) {
        halfroute = "/0001 help.html"
    } else if (towork == 2) {
        halfroute = "/0002 help.html"
    } else if (towork == 6) {
        halfroute = "/0006 help.html"
    } else if (towork == 7) {
        halfroute = "/0007 help.html"
    } else if (towork == 8) {
        halfroute = "/0008 help.html"
    } else if (towork == 14) {
        halfroute = "/0014 help.html"
    } else if (towork == 15) {
        halfroute = "/0015 help.html"
    } else if (towork == 99) {
        halfroute = "/Time help.html"
    }
    let fullroute = HELP_ROUTE + halfroute
    window.open(
    fullroute,
    "_blank",
    "width=600,height=400,top=100,left=100, toolbar=no,scrollbars=yes,resizable=no");
}

function infotype_select(opc){
    SELECTION = opc;
}

function clean(){
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.checked = false);
}
