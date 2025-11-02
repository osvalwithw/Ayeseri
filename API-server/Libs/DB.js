import mysql from 'mysql2/promise'

let _Pool;
export function getDB(){
    if(_Pool) return _Pool;
    _Pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0
    });
    return _Pool;
}