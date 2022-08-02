import express, { response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const jwt = require("jsonwebtoken");
const sendGridMail = require("@sendgrid/mail");
export const Router = express.Router();

const SignUpSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model("Authenticate", SignUpSchema);

function authenticateToken(req: any, res: any, next: any) {
  console.log("Authentication", req.headers);
  const accesstoken = jwt.sign(
    { user: req.body.username },
    process.env.ACCESS_TOKEN
  );
  if (accesstoken == null) res.sendStatus(401);
  jwt.verify(accesstoken, process.env.ACCESS_TOKEN, (err: any, user: any) => {
    if (err) {
      console.log("Error: ", err);
      return res.sendStatus(403);
    }
    const jwtdata = {
      bod: req.body,
      user,
    };
    console.log({ res });
    res.locals = jwtdata;
    next();
  });
}

Router.post("/signup", async (req, res) => {
  console.log("Post started");
  // console.log(Object.keys(req));
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      password: hashedPassword,
      email: req.body.email,
      username: req.body.username,
    });
    user.save((err: any, data: any) => {
      if (err) {
        console.log("Error in insertion", err);
      } else {
        console.log("Data Inserted...");
        const mail = {
          to: user.email,
          from: "tarun.agrawal@geminisolutions.com",
          subject: "Account Created",
          text: "Hey! You are eligible for logIn now.",
        };
        sendGridMail.setApiKey(process.env.SENDGRID_API);
        sendGridMail
          .send(mail)
          .then((response: any) => {
            console.log("Mail sent successfully!");
          })
          .catch((error: any) => {
            console.error(error);
            res.status(402).send(false);
          });
      }
      res.status(200).send(true);
    });
  } catch {
    console.log("post error");
  }
});

Router.post("/login", authenticateToken, async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  console.log(Object.keys(req.body), user);
  if (user !== null) {
    console.log("Logged In");
    const HashCheck = await bcrypt.compare(req.body.password, user.password);
    console.log(req.body.password, user.password);
    console.log("HashCheck: ", HashCheck, res.locals);
    if (HashCheck && res.locals.user) {
      res.send({ bool: true, user });
      console.log("true");
    } else {
      res.send({ bool: false });
      console.log("false");
    }
  } else {
    console.log("Hey: ", req.body);
  }
});
