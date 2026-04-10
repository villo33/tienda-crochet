const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1003645363",
    database: "crochet"
});

db.connect(err => {
    if(err) console.log(err);
    else console.log("BD conectada");
});

module.exports = db;