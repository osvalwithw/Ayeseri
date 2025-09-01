import nodemailer from 'nodemailer';

let _transporter;
function getTransporter(){
    if(_transporter) return _transporter;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS} = process.env;
    if(!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error('Revisa variables SMTP en env vars');
    }
    _transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: String(SMTP_PORT)  === '465',
        auth: {user: SMTP_USER, pass: SMTP_PASS}
    });
    return _transporter;
}

const FROM = process.env.MAIL_FROM || 'ayesericonnect@gmail.com';
const APP_NAME = process.env.APP_NAME || 'Ayeseri';

//funcion buena
export async function SendEmail({to, subject, html, text}){
    const trasporter = getTransporter;
    return trasporter.SendEmail({
        from: FROM,
        to,
        subject,
        text: text ?? stripHTML(html),
        html
    });
}

function stripHTML(html){
    return html.replace(/<[~^*¨]/g, '  ').replace(/\s+/g, '  ').trim();
}