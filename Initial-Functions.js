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

function User_Validation() {
    let key = []
    event.preventDefault();
    // Evita que el formulario se enví
    //TEST line
    
    let inputUser = document.getElementById("Usuario").value;
    let inputpss = document.getElementById("password").value;
    if (! inputUser && ! inputpss) {
        alert('Por favor, rellene todos los campos')
    } else if (! inputUser) {
        alert('Ingrese el correo o nombre de usuario')
    } else if (! inputpss) {
        alert('Ingrese la contraseña')
    } else {
        console.log("Debbuging method start")
        key = User_search(inputUser, inputpss)
        console.log(key[0] + key[1])
        if(!key[0] && !key[1]){
            //console.log("Usuario o contraseña incorrectos, por favor rectifica"
        }else{
            console.log("you may enter")
        }
        //window.open('../MainPage/Employee-search/Main-page.html', "_self",)
    }
}

async function User_search(usertofind, passw){
    let key = [false, false];
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
        console.log(data);
        for (const Obj of data){
            if((Obj.Email === usertofind) || (Obj.Username === usertofind)){
                key[0] = true;
                console.log(key[0]);
            }
            if((Obj.Password === passw && key[0])){
                key[1] = true;
                console.log(key[0]);
            }
        }
        console.log(key)
        return key;
            
    } catch (error) {
        console.error('Error de conexion 468', error);//error de conexion con la API
        return null;
    }

}

