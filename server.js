require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================== CONFIGURAR CLOUDINARY ================== */

cloudinary.config({
    cloud_name: "Untitled",
    api_key: "922379677878479",
    api_secret: "cbqhx1YWOSOsTReVGjuE9lyoUFw"
});

/* ================== CONFIGURAR MULTER (MEMORIA) ================== */

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

/* GUARDAR CON CLOUDINARY */
app.post("/productos", upload.single("imagen"), async (req, res) => {
    try {
        const { nombre, precio, cantidad } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Imagen requerida" });
        }

        // Subir a Cloudinary
        const resultado = await cloudinary.uploader.upload_stream(
            { folder: "tienda_crochet" },
            async (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ error: "Error subiendo imagen" });
                }

                const imagen = result.secure_url;

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
            }
        );

        resultado.end(req.file.buffer);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error servidor" });
    }
});

/* ELIMINAR (SOLO BD, NO CLOUDINARY POR AHORA) */
app.delete("/productos/:id", (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM productos WHERE id=?", [id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "error al eliminar" });
        }
        res.json({ mensaje: "producto eliminado" });
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