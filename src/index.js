const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 2804;
const route = require("./routes");
const cors = require("cors");
const { connection } = require("./configs/connectDB");

//config req body
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

//cors
app.use(cors());

// routes
route(app);

// connect db
connection();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
