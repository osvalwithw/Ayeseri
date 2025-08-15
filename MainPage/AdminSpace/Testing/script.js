function extraerTexto() {
    // Obtener el valor del input con id="nombre"
    var inputNombre = document.getElementById("nombre").value;
    // Mostrar el valor en una alerta
    alert("Texto extraído: " + inputNombre);
    // También puedes mostrar el texto extraído en un elemento <p>
    document.getElementById("resultado").innerText = "Texto extraído: " + inputNombre;
}
