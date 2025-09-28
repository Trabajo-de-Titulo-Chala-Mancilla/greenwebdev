const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

// POST /calculate/email
// Debe ser **una función**, no el objeto completo
router.post("/", emailController.calculateEmail);

module.exports = router;
