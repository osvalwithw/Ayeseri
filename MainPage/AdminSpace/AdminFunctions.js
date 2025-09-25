function AdminView(ViewOPC){
    const windows = [
    document.getElementById("Usersview"),
    document.getElementById("Errorsview"),
    document.getElementById("UserCreationView")
    ];
    windows.forEach(window => {
        console.log(window);
        window.style.display = 'none'
    });
    if(windows[ViewOPC]){
        windows[ViewOPC].style.display = 'block';
        if(ViewOPC === 2){
            bringtickets();
        }
    }
}

async function bringtickets(){
    fetch(`https://ayeseri.onrender.com/GetTickets`)
    .then(res => { 
        if (!res.ok) throw new Error('Please review API Connection');
            return res.json();
    })
    .then(data => {
    printingtickets(data);
    })
    .catch(err => {
    console.error("Failed to load errors, please review the API Conection or logs", err);
    });
}

AdminView(2);

function printingtickets(data){
    const pasteinformation = document.getElementById('TableItems');
    pasteinformation.innerHTML = '';
    data.forEach(item => {
        let insertline = document.createElement('tr');
        insertline.innerHTML=`
            <td><input type="checkbox"></td>
            <td>${item.NoTicket}</td>
            <td>${item.User}</td>
            <td>${item.Email}</td>
            <td>${item.Psswd}</td>
            <td>${item.Upload_Time}</td>
        `;
        pasteinformation.appendChild(insertline);
    });
}