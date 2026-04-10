const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1003645363", // 👈 CAMBIO AQUÍ
    database: process.env.DB_NAME || "crochet",
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if(err){
        console.log("❌ Error conexión:", err);
    }else{
        console.log("✅ Base de datos conectada");
    }
});

module.exports = db;