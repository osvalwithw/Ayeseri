function display_errors() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID');
    const it = params.get('IT');
    const Timeselect = params.get('Timepar');
    console.log(`${id}, ${it}, ${Timeselect}`)

    const input = document.getElementById('EE_Number');
    if (input && id) {
        input.value = id;
    }
    document.getElementById('Header_1').textContent = `Category ${it} errors`;

    fetch(`https://ayeseri.onrender.com/employee_errors/${id}/${Timeselect}`)
    .then(res => {
    if (!res.ok) throw new Error('Fallo la API');
        return res.json();
    })
    .then(data => {
    mostrarTabla(data.rows);
    })
    .catch(err => {
    console.error("❌ Error al obtener errores:", err);
    });
}

function mostrarTabla(errores) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ID');
    const it = params.get('IT');
    const Timeselect = params.get('Timepar');
    const tbody = document.getElementById('T_errors_headers');
    if (!tbody) {
        console.error("Review were is going to be created the information, missing DIV");
        return;
    }

    errores.forEach(error => {
        console.log("Error: ", error.Error_message);
        console.log("IT:", it)
        if(it == error.ID_Infotype){
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${error.Load_Date}</td>
            <td>${error.Load_hour}</td>
            <td>${error.Error_message}</td>
            <td>${error.ID_Infotype}</td>
            `;
            tbody.appendChild(row);
        } 
        else if(it == 'Others' && (error.ID_Infotype == 'NITR' || error.ID_Infotype == 'CFGI')){
            const row = document.createElement('tr');
            row.innerHTML = `
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
