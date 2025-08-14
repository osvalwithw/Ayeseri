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

function extrae() {
    event.preventDefault();
    // Evita que el formulario se enví
    //TEST line
    
    let inputNombre = document.getElementById("Usuario").value;
    let inputpss = document.getElementById("password").value;
    if (! inputNombre && ! inputpss) {
        alert('Por favor, rellene todos los campos')
    } else if (! inputNombre) {
        alert('Ingrese el correo')
    } else if (! inputpss) {
        alert('Ingrese la contraseña')
    } else {
        User_search()
        window.open('../MainPage/Employee-search/Main-page.html', "_self",)
    }
}

async function User_search(usertofind){
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
        alert(data)
        
    } catch (error) {
        console.error('Error de conexion 468', error);//error de conexion con la API
        return null;
    }

    }
}

