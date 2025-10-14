const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/pdf", reportController.generateReportPDF);

module.exports = router;
