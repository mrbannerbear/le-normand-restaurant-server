import express from "express";
import cors from "cors";

import dotenv from "dotenv";


const port = process.env.PORT || 4500;

const app = express();

// Middleware
app.use(express.json()); // Parses incoming json requests
app.use(cors()); // Allows server to handle incoming requests
dotenv.config(); // Loads .env file contents into process.env by default

app.all("*", (req, res, next) => {
    const error = new Error(`The request URL ${req?.url} could not be found`)
})