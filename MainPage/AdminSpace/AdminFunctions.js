function AdminView(ViewOPC){
    const windows = [
    document.querySelector(".main-window"),
    document.querySelector(".errors-window"),
    document.querySelector(".usercreation-window")
    ];
    windows.forEach(window => {
        window.style.display = 'none'
    });
    if(windows[ViewOPC]){
        windows[ViewOPC].style.display = 'block';
    }
}

AdminView(1)

async function bringtickets(){
    fetch(`https://ayeseri.onrender.com/employee_errors/${id}/${Timeselect}`)
    .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
    mostrarTabla(data.rows);
    })
    .catch(err => {
    console.error("Failed to load errors, please review the API Conection or logs", err);
    });
}