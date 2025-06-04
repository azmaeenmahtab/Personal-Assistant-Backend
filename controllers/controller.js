const dotenv = require("dotenv");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


dotenv.config();


//register api
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {

            return res.status(400).json({ success: false, error: "All fields are required !!" });
        }

        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(password, saltRounds);


        const result = await db.query("INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4)", [name, email, phone, hashedPass]);

        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }



}
//login api
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid password" });
        }

        // Return user data (excluding password) and token in a single response
        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            success: true,
            user: userWithoutPassword,
            token
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
}
//total cost insert
const budgetInput = async (req, res) => {
    try {

        const userId = req.user.userId;

        const { main_budget } = req.body;

        const result = await db.query("INSERT INTO data (user_id, main_budget) VALUES ($1, $2) RETURNING *", [userId, main_budget]);

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, error: "Failed to input Main Budget" });
        }
        res.status(200).json({ success: true, message: "Successfully inserted Main Budget", data: result.rows[0] });
    } catch (err) {

        return res.status(500).json({ success: false, error: "Internal server error" });
    }



}
//rental cost insert
const rentalInput = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { rental_budget } = req.body;

        const result = await db.query("UPDATE data SET seat_rent = $1 WHERE user_id = $2 RETURNING *", [rental_budget, userId]);

        if (result.rows.length === 0) {
            console.warn(`Attempted to update rental budget for user ${userId}, but no row found in data table.`);
            return res.status(404).json({
                success: false,
                error: "User data not found or failed to update rental budget."
            });
        }

        res.status(200).json({
            success: true,
            message: "Successfully updated rental data",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Rental input error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}
//food cost insert
const foodCostInput = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { food_cost } = req.body;

        const result = await db.query("UPDATE data SET food_cost = $1 WHERE user_id = $2 RETURNING *", [food_cost, user_id]);

        if (result.rows.length == 0) {

            console.log("attempted to update food column but no row returned");
            return res.status(404).json({
                success: false,
                error: "failed to insert food cost"
            })
        }

        res.status(200).json({
            success: true,
            message: "food cost inserted succesfully"
        });

    } catch (error) {
        console.error("Rental input error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })

    }
}
//utility cost insert
const utilityCostInput = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { utility_cost } = req.body;

        if (utility_cost === undefined || isNaN(utility_cost)) {

            return res.status(400).json({
                success: false,
                error: "invalid utility cost"
            })
        }

        const result = await db.query("UPDATE data SET utility_cost = $1 WHERE user_id = $2 RETURNING *", [utility_cost, user_id]);

        if (result.rows.length == 0) {

            console.log("attempted to update utility column but no row returned");
            return res.status(404).json({
                success: false,
                error: "failed to insert utility cost"
            })
        }

        res.status(200).json({
            success: true,
            message: "utility cost inserted succesfully"
        });

    } catch (error) {
        console.error("utility input error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })

    }
}
//transport distance insertion
const transportDistanceInput = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { distance } = req.body;

        if (distance === undefined || isNaN(distance)) {

            return res.status(400).json({
                success: false,
                error: "invalid transport distance"
            })
        }

        const result = await db.query("INSERT INTO transportinfo (user_id, distance) VALUES ($1, $2) RETURNING *", [user_id, distance]);

        if (result.rows.length == 0) {

            console.log("attempted to update Distance column but no row returned");
            return res.status(404).json({
                success: false,
                error: "failed to insert transport Distance"
            })
        }

        res.status(200).json({
            success: true,
            message: "transport distance inserted succesfully"
        });

    } catch (error) {
        console.error("transport distance input error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })

    }
}
//get distance for fare calclation
const getDistance = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await db.query("SELECT distance FROM transportinfo WHERE user_id = $1 ORDER BY data_id DESC LIMIT 1", [userId]);

        if (!result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Cant get distance from db"
            })
        };

        const data = result.rows[0];

        res.status(200).json({
            success: true,
            message: "get distance data successfully",
            data: data
        })
    } catch (error) {

        console.error(error);
        return res.status(400).json({
            success: false,
            error: "Internal server error", error
        })
    }
}

const vehicleAndFareInput = async (req, res) => {

    try {
        const user_id = req.user.userId;

        const { vehicle, vehicle_fare } = req.body;

        if (vehicle_fare === undefined || isNaN(vehicle_fare)) {

            return res.status(400).json({
                success: false,
                error: "invalid vehicle fare"
            })
        }

        const result = await db.query("UPDATE transportinfo SET vehicle = $1, vehicle_fare = $2 WHERE user_id = $3 RETURNING *", [vehicle, vehicle_fare, user_id]);

        if (result.rows.length == 0) {

            console.log("attempted to update vehicle and fare column but no row returned");
            return res.status(404).json({
                success: false,
                error: "failed to insert vehicle and fare"
            })
        }

        res.status(200).json({
            success: true,
            message: "vehicle name and cost inserted succesfully"
        });

    } catch (error) {
        console.error("vehicle and cost input error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        })

    }
}



module.exports = {
    register,
    login,
    budgetInput,
    rentalInput,
    foodCostInput,
    utilityCostInput,
    transportDistanceInput,
    getDistance,
    vehicleAndFareInput
}



