import express from "express";
import bodyParser from "body-parser";
import { Router } from "./route";
import { connect } from "./connectdb";
import cors from "cors";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

require("dotenv").config();
app.use(cors());
app.use(Router);

const port = process.env.port || 8000;

app.listen(port, (): void => {
  console.log(`server running on port: ${port}`);
  connect();
});
