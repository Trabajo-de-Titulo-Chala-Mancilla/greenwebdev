const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// GET /dashboard
// Pasa la función correcta del controller
router.get("/", dashboardController.getDashboardData);

module.exports = router;
