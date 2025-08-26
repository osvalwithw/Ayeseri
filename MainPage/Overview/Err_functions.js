function display_errors() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID');
    const it = params.get('IT');
    const timepar = params.get('timepar');

    const input = document.getElementById('EE_Number');
    if (input && id) {
        input.value = id;
    }
    document.getElementById('Header_1').textContent = `Overview Infotype ${it} errors`;

    fetch(`https://ayeseri.onrender.com/employee_errors/${id}/${timepar}`)
    .then(res => {
    if (!res.ok) throw new Error('Fallo la API');
        return res.json();
    })
    .then(data => {
    mostrarTabla(data);
    })
    .catch(err => {
    console.error("❌ Error al obtener errores:", err);
    });
}

function mostrarTabla(errores) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID');
    const it = params.get('IT');
    const tbody = document.getElementById('tablaErrores');
    if (!tbody) {
        console.error("❌ No se encontró el tbody con id 'tablaErrores'");
        return;
    }

    errores.forEach(error => {
        console.log(error.Error_message)
        if(it == error.ID_Infotype){
            const row = document.createElement('tr');
            row.innerHTML = `
            <td></td>
            <td>${error.Load_Date}</td>
            <td>${error.Load_hour}</td>
            <td>${error.Error_message}</td>
            <td>${error.ID_Infotype}</td>
            `;
            tbody.appendChild(row);
        } else if(it == 'OTHR' && (error.ID_Infotype == 'NITR' || error.ID_Infotype == 'CFGI')){
            const row = document.createElement('tr');
            row.innerHTML = `
            <td></td>
            <td>${error.Load_Date}</td>
            <td>${error.Load_hour}</td>
            <td>${error.Error_message}</td>
            <td>${error.ID_Infotype}</td>
            `;
            tbody.appendChild(row);
        }
    });
    }

    document.addEventListener('DOMContentLoaded', display_errors);
