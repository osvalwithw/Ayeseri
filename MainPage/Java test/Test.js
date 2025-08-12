/*function suma(a, b, callback) {
    let resultado = a + b;
    callback(resultado);
}

suma(1, 2, function(resultado) {
    console.log(`la suma es: ${resultado}`)
})

setTimeout(function(){
    console.log("Esperando 3 segundos")
}, 3000)

console.log("Pasaron los 3 segundos")*/

/*
//Secuencial
console.log(1)
console.log(2)
console.log(3)

//Asincrono
setTimeout(() =>{
    console.log(4);
}, 3000);
console.log(2);
console.log(3);
*/

//objeto literal
var empleado1 = {
    nombre: "Pancho",
    edad: 25,
    soltera: true,
    job: ["instructor", "SRE", "Cybersecurity"],
    presentacion: function(){
        console.log("Hola, soy Panche y no se que mas decir");
    }
}

//Map
var miMap = new Map();

miMap.set("nombre", "Nadia");
miMap.set("Edad", 73);
miMap.set("Soltera", false);

//WeakMap. - Estructura pares de claves, si no es accesido por ninguna parte del codigo, se elimina

const map = new WeakMap();
const obj = {};
map.set(obj, "Valor asociado con obj");
console.log(map.get(obj))

//Minimizar loops
//usar la cache de forma efectiva
//No consultar de forma innecesaria la base de datos