const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = "elaleman"; // 🔒 Cambia esta contraseña

const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadFolder));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Página principal
app.get("/", (req, res) => {
  const files = fs.readdirSync(uploadFolder);
  const imagesHtml = files
    .map(
      file => `
        <div style="margin-bottom: 20px;">
          <img src="/uploads/${file}" width="300"><br>
          <input type="text" value="${req.protocol}://${req.get("host")}/uploads/${file}" readonly onclick="this.select()">
        </div>
      `
    )
    .join("");

  res.send(`
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Galería de imágenes</title>
      <style>
        body { font-family: sans-serif; background: #f5f5f5; text-align: center; padding: 2rem; }
        form { background: white; padding: 1rem; border-radius: 10px; display: inline-block; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        input, button { margin: 5px; padding: 5px; }
        img { border-radius: 10px; }
      </style>
    </head>
    <body>
      <h1>Subir nueva imagen</h1>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required><br>
        <input type="password" name="clave" placeholder="Contraseña" required><br>
        <button type="submit">Subir</button>
      </form>
      <h2>Galería</h2>
      ${imagesHtml}
    </body>
    </html>
  `);
});

// Ruta de subida
app.post("/upload", upload.single("image"), (req, res) => {
  const clave = req.body.clave;
  if (clave !== PASSWORD) {
    return res.send(`<p>⛔ Contraseña incorrecta</p><a href="/">Volver</a>`);
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.send(`
    <p>✅ Imagen subida con éxito</p>
    <p><a href="${url}" target="_blank">${url}</a></p>
    <img src="${url}" width="300"><br><br>
    <a href="/">Volver</a>
  `);
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
