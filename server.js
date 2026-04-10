const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================== CONFIGURAR SUBIDA DE IMÁGENES ================== */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads"); // carpeta donde se guardan
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/* HACER PÚBLICA LA CARPETA */
app.use("/uploads", express.static("uploads"));

/* ================== PRODUCTOS ================== */

/* LISTAR PRODUCTOS */
app.get("/productos", (req, res) => {
    db.query("SELECT * FROM productos", (err, data) => {
        if(err){
            console.log(err);
            return res.status(500).json({error:"error BD"});
        }
        res.json(data);
    });
});

/* GUARDAR PRODUCTO CON IMAGEN REAL */
app.post("/productos", upload.single("imagen"), (req,res)=>{
    const { nombre, precio, cantidad } = req.body;
    const imagen = req.file.filename;

    db.query(
        "INSERT INTO productos (nombre, precio, imagen, cantidad) VALUES (?,?,?,?)",
        [nombre, precio, imagen, cantidad],
        ()=> res.json({mensaje:"ok"})
    );
});

/* ELIMINAR PRODUCTO */
app.delete("/productos/:id", (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
        if(err){
            console.log(err);
            return res.status(500).json({error:"error al eliminar"});
        }
        res.json({mensaje:"producto eliminado"});
    });
});

/* EDITAR PRODUCTO */
app.put("/productos/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    db.query(
        "UPDATE productos SET nombre=?, precio=? WHERE id=?",
        [nombre, precio, id],
        (err) => {
            if(err){
                console.log(err);
                return res.status(500).json({error:"error al actualizar"});
            }
            res.json({mensaje:"producto actualizado"});
        }
    );
});

/* ================== SERVIDOR ================== */

app.listen(3000, () => {
    console.log("🚀 Servidor corriendo en http://localhost:3000");
});