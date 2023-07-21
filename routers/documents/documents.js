import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.use(express.json());

const Documents = mongoose.model("Documents", {
  subject: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  lever: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Một số giá trị trạng thái bạn muốn sử dụng
    default: "active", // Trạng thái mặc định khi tạo tài liệu mới
  },
});

// Định tuyến POST để tạo mới tài liệu
router.post("/documents", async (req, res) => {
  try {
    const { subject, grade, lever, file } = req.body;

    // Tạo tài khoản mới
    const newDocuments = new Documents({
      subject,
      grade,
      lever,
      file,
    });

    // Lưu vào cơ sở dữ liệu
    const insert = await newDocuments.save();
    return res.json({
      message: "Documents registered successfully",
      docID: insert._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});
router.get("/documents", async (req, res) => {
  try {
    const { query } = req;
    const documents = await Documents.find(query);
    res.status(200).send(documents);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("Lỗi server");
  }
});
router.get("/documents/:id", async (req, res) => {
  try {
    const documentId = req.params.id;
    const document = await Documents.findById(documentId);
    res.status(200).json(document);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.delete("/documents/:id", async (req, res) => {
  try {
    const documentId = req.params.id;
    const deletedCalendar = await Documents.findByIdAndDelete(documentId);
    if (!deletedCalendar) {
      return res.status(404).json({ message: "Documents not found" });
    }
    res.status(200).json({ message: "Documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default router;
