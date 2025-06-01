const express = require("express");
const router = express.Router();
const apiController = require("../controllers/controller");
const authMiddleware = require("../middleware/authmiddleware");


//routes
router.post("/register", apiController.register);

router.post("/login", apiController.login);

router.post("/main_budget", authMiddleware, apiController.budgetInput);

router.post("/rental_budget", authMiddleware, apiController.rentalInput);

router.post("/food_budget", authMiddleware, apiController.foodCostInput);
router.post("/utility_budget", authMiddleware, apiController.utilityCostInput);






























module.exports = router;