// Setup empty JS object to act as endpoint for all routes
const projectData = {};

// Require Express to run server and routes
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

app.use(express.static("../"));

// Setup Server
const port = 8080;
const server = app.listen(port, () => {
  console.log("server is running :)");
  console.log(`running on localhost:${port}`);
});
