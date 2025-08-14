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
        window.open('../MainPage/Employee-search/Main-page.html', "_self",)
    }
}
