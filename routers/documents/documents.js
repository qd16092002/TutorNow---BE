import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.use(express.json());

const Documents = mongoose.model("Documents", {
  subject: {
    type: String,
  },
  grade: {
    type: String,
  },
  lever: {
    type: String,
  },
  file: {
    type: String,
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
    const documents = await Documents.find();

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
export default router;
