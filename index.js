import express from "express";
import {
  authencationRouter,
  calendarRouter,
  documentsRouter,
  otpRouter,
} from "./routers/index.js";
import "./loadEnvironment.js";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const port = process.env.PORT ?? 3000;

mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const whitelist = ["http://localhost:3003"]; //white list consumers
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};
app.use(cors(corsOptions));
app.use("/", authencationRouter);
app.use("/", documentsRouter);
app.use("/", otpRouter);
app.use("/", calendarRouter);

app.get("/", (req, res) => {
  res.send("Hello, 123!");
});

app.listen(port, async () => {
  console.log(`listening on port : ${port}`);
});
