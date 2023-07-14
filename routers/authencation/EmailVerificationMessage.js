import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const router = express.Router();

// Cấu hình Nodemailer cho Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "webtutornow@gmail.com",
    pass: "tranquangminh",
  },
});

router.use(express.json());

// Lưu mã OTP và thông tin người dùng đã gửi OTP
const otpMap = new Map();

// Gửi mã OTP qua email
router.post("/sentotp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // Kiểm tra xem người dùng đã gửi OTP trước đó hay chưa
  if (otpMap.has(email)) {
    return res.status(400).json({ error: "OTP has already been sent." });
  }

  const otp = generateOTP(6); // Tạo OTP gồm 6 chữ số
  const token = generateToken(email, otp); // Tạo token chứa thông tin người dùng và OTP

  sendEmail(email, otp); // Gửi email chứa OTP

  // Lưu thông tin OTP và token vào bộ nhớ tạm
  otpMap.set(email, { otp, token });

  res.json({ message: "OTP sent successfully." });
});

// Xác minh OTP
router.post("/verifyotp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  // Kiểm tra xem người dùng đã gửi OTP trước đó hay chưa
  if (!otpMap.has(email)) {
    return res.status(400).json({ error: "OTP is not sent for this email." });
  }

  // Lấy thông tin OTP và token từ bộ nhớ tạm
  const { savedOtp, token } = otpMap.get(email);

  // Kiểm tra xem OTP nhập vào có khớp không
  if (otp !== savedOtp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  // Xác minh thành công, giải mã token và trả về thông tin người dùng
  const decodedToken = jwt.verify(token, secretKey);
  const userId = decodedToken.userId; // Thông tin người dùng, ví dụ: ID người dùng

  // Xóa thông tin OTP và token từ bộ nhớ tạm
  otpMap.delete(email);

  res.json({ message: "OTP verification successful.", userId });
});

function generateOTP(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
const secretKey = crypto.randomBytes(32).toString("hex");
function generateToken(email, otp) {
  const payload = {
    userId: "user_id_here", // Thông tin người dùng, ví dụ: ID người dùng
    email,
    otp,
  };

  return jwt.sign(payload, secretKey, { expiresIn: "5m" }); // Thời gian hết hạn của token: 5 phút
}

function sendEmail(email, otp) {
  const mailOptions = {
    from: "webtutornow@gmail.com", // Địa chỉ email gửi
    to: email, // Địa chỉ email nhận
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

export default router;
