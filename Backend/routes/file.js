const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Importar correctamente el controller
const fileController = require("../controllers/fileController");

// POST /calculate/file
// Debe pasar **una función**, no un objeto
router.post("/", upload.single("file"), fileController.calculateFile);

module.exports = router;
