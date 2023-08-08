const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 1024 * 1024 * 1024

  },
  abortOnLimit: true,
}));
app.use(morgan("dev"));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/uploads", (req, res) => {
  // 
  if (!req.files) {
    return res.status(400).send("no file attached");
  }
  // extensiones permitidas
  const allowedExtensions = ['.png', '.jpg', 'jpeg', '.pdf'];

  //recorremos el arreglo de archivos, dejando en 'element' cada uno de ellos
  Object.keys(req.files).forEach(element => {
    // extraemos la extensión del archivo que figura en element
    const extensionName = path.extname(req.files[element].name);
    // validamos su extensión
    if (!allowedExtensions.includes(extensionName)) {
      return res.status(422).send("invalid file type");
    }

    // determinamos el path donde dejaremos ese archivo
    const _path = `${__dirname}/files/${req.files[element].name}`;
    // movemos el archivo a dicho path
    req.files[element].mv(_path, (error) => {
      if (error) {
        return res.status(500).send(error);
      }
    });
  });
  // si todo va ok con los n archivos, enviamos el status 200
  return res.status(200).send({ message: 'file upload sussed' });
});

app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send("no file attached");
  }
  const file = req.files.myFile;
  const _path = `${__dirname}/files/${file.name}`;
  file.mv(_path, (error) => {
    if (error) {
      return res.status(500).send(error);
    }
  });
  res.status(200).send({ code: 200, message: "todo pulento" });
});

app.delete("/delete/:fileName", (req, res) => {
  const { fileName } = req.params;
  const _path = `${__dirname}/files/${fileName}`;

  fs.unlink(_path, (err) => {
    if (err) throw err;
    console.log("problemas borrando archivo");
  });
  res.status(200).send("archivo borrado");
});

app.get("/rename/:oldName/:newName", (req, res) => {
  const { oldName, newName } = req.params;
  const _oldPath = `${__dirname}/files/${oldName}`;
  const _newPath = `${__dirname}/files/${newName}`;

  fs.rename(_oldPath, _newPath, (err) => {
    if (err) throw err;
    fs.stat(_newPath, (err, stats) => {
      if (err) throw err;
      console.log(`stats: ${JSON.stringify(stats)}`);
      res.status(200).send(JSON.stringify(stats));
    });

  });

  return; // res.status(200).send(JSON.stringify(stats));
});


app.listen(3000, () => {
  console.log("listen in port 3000");
})