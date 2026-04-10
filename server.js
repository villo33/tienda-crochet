const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================== ASEGURAR CARPETA UPLOADS ================== */

const uploadPath = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

/* ================== CONFIGURAR MULTER ================== */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/* HACER PÚBLICA LA CARPETA */
app.use("/uploads", express.static(uploadPath));

/* ================== PRODUCTOS ================== */

/* LISTAR */
app.get("/productos", (req, res) => {
    db.query("SELECT * FROM productos", (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "error BD" });
        }
        res.json(data);
    });
});

/* GUARDAR */
app.post("/productos", upload.single("imagen"), (req, res) => {
    try {
        const { nombre, precio, cantidad } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Imagen requerida" });
        }

        const imagen = req.file.filename;

        db.query(
            "INSERT INTO productos (nombre, precio, imagen, cantidad) VALUES (?,?,?,?)",
            [nombre, precio, imagen, cantidad],
            (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: "Error al guardar" });
                }
                res.json({ mensaje: "ok" });
            }
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error servidor" });
    }
});

/* ELIMINAR */
app.delete("/productos/:id", (req, res) => {
    const { id } = req.params;

    db.query("SELECT imagen FROM productos WHERE id=?", [id], (err, data) => {
        if (data && data.length > 0) {
            const ruta = path.join(uploadPath, data[0].imagen);
            if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
        }

        db.query("DELETE FROM productos WHERE id=?", [id], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "error al eliminar" });
            }
            res.json({ mensaje: "producto eliminado" });
        });
    });
});

/* EDITAR */
app.put("/productos/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    db.query(
        "UPDATE productos SET nombre=?, precio=? WHERE id=?",
        [nombre, precio, id],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "error al actualizar" });
            }
            res.json({ mensaje: "producto actualizado" });
        }
    );
});

/* ================== SERVIDOR ================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Servidor corriendo en puerto " + PORT);
});