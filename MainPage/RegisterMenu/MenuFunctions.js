



function SendRequest() {
    // Mapeo de campos (input + label + mensaje requerido)
    const fields = [
        { input: '#NoTicket', label: '#NoTicketlbl', msg: 'Coloca el número de ticket.' },
        { input: '#Username', label: '#Usernamelb',  msg: 'Se necesita nombre de usuario.' },
        { input: '#Email',    label: '#Emaillb',     msg: 'Coloca el email.' },
        { input: '#PSS',      label: '#passwordlb',  msg: 'Coloca la contraseña.' },
        { input: '#RPTPSS',   label: '#RPTPSSlb',    msg: 'Repite la contraseña.' },
    ];

    const errors = [];
    let firstInvalid = null;
    const values = {};

    // Reset visual
    fields.forEach(({label}) => {
        const lbl = document.querySelector(label);
        if (lbl) lbl.style.color = 'black';
    });

    // 1) Requeridos
    for (const { input, label, msg } of fields) {
        const el  = document.querySelector(input);
        const lbl = document.querySelector(label);
        const val = (el?.value || '').trim();

        values[input] = val;
        const invalid = !val;

        if (lbl) lbl.style.color = invalid ? 'red' : 'black';
        if (invalid) {
        if (!firstInvalid) firstInvalid = el;
        errors.push(`• ${msg}`);
        }
    }

    // 2) Ticket debe empezar con RITM
    if (values['#NoTicket'] && !values['#NoTicket'].startsWith('RITM')) {
        errors.push('• El número de ticket debe empezar con "RITM".');
        const lbl = document.querySelector('#NoTicketlbl');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#NoTicket');
    }
 
    if (values['#Email']) {
        const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicEmail.test(values['#Email'])) {
        errors.push('• El email no tiene un formato válido.');
        const lbl = document.querySelector('#Emaillb');
        if (lbl) lbl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#Email');
        }
    }

    const pass = values['#PSS'];
    const rpass = values['#RPTPSS'];
    if (pass && rpass && pass !== rpass) {
        errors.push('• Las contraseñas no coinciden.');
        const pl = document.querySelector('#passwordlb');
        const rl = document.querySelector('#RPTPSSlb');
        if (pl) pl.style.color = 'red';
        if (rl) rl.style.color = 'red';
        if (!firstInvalid) firstInvalid = document.querySelector('#RPTPSS');
    }

    if (errors.length) {
        if (firstInvalid) firstInvalid.focus();
        alert(errors.join('\n'));
        return false;
    }

    console.log('Formulario válido, listo para enviar');
    return true;
}

