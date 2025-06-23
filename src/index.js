const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 2804;
const route = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connection } = require("./configs/connectDB");

// cookie
app.use(cookieParser()); // for cookies
//config req body
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

//cors
app.use(
  cors({
    origin: "http://localhost:3000", // React app domain
    credentials: true, // Cho phép cookie
  })
);

// routes
route(app);

// connect db
connection();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
