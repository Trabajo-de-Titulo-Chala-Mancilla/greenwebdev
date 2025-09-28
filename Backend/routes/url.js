const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

router.post("/", urlController.calculateUrl);

module.exports = router;
