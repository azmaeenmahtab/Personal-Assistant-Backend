const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Routes = require("./routes/apiroutes")

//basic middlewares
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//main path for my backend
app.use("/api", Routes);