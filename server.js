const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadFolder));
app.use(express.static("public"));

app.post("/upload", upload.single("image"), (req, res) => {
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.send(`
    <p>Imagen subida correctamente</p>
    <p><a href="${url}" target="_blank">${url}</a></p>
    <img src="${url}" style="max-width:300px;" />
    <br><a href="/">Subir otra</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
