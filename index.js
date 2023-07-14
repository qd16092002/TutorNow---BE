import express from "express";
import {
  authencationRouter,
  calendarRouter,
  documentsRouter,
  otpRouter,
} from "./routers/index.js";
import "./loadEnvironment.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT ?? 3000;

mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

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