import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.use(express.json());

const Calendar = mongoose.model("Calendar", {
  nameStudent: {
    type: String,
    required: true,
  },
  codeClass: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  nameTutor: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  numberoflessonslaeared: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  cost: {
    type: String,
    required: true,
  },
  phonenuberstudent: {
    type: String,
    required: true,
  },
});

// Định tuyến POST để tạo mới lich
router.post("/calendar", async (req, res) => {
  try {
    const {
      nameStudent,
      codeClass,
      subject,
      nameTutor,
      time,
      numberoflessonslaeared,
      location,
      cost,
      phonenuberstudent,
    } = req.body;

    // Tạo lich mới
    const newCalendar = new Calendar({
      nameStudent,
      codeClass,
      subject,
      nameTutor,
      time,
      numberoflessonslaeared,
      location,
      cost,
      phonenuberstudent,
    });

    // Lưu vào cơ sở dữ liệu
    const insert = await newCalendar.save();
    return res.json({
      message: "Calendar registered successfully",
      docID: insert._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});
router.get("/calendar", async (req, res) => {
  try {
    const { query } = req;
    const calendar = await Calendar.find(query);
    res.status(200).send(calendar);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("Lỗi server");
  }
});
router.get("/calendar/:id", async (req, res) => {
  try {
    const calendarId = req.params.id;
    const calendar = await Calendar.findById(calendarId);

    res.status(200).json(calendar);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.delete("/calendar/:id", async (req, res) => {
  try {
    const calendarId = req.params.id;
    const deletedCalendar = await Calendar.findByIdAndDelete(calendarId);
    if (!deletedCalendar) {
      return res.status(404).json({ message: "Calendar not found" });
    }
    res.status(200).json({ message: "Calendar deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
