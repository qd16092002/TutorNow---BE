import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
const router = express.Router();

router.use(express.json());

// Tạo model User
const User = mongoose.model("User", {
  username: {
    type: String,
    unique: true,
  },
  fullName: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["TUTOR", "ADMIN", "STUDENT"],
    default: "STUDENT",
  },
  email: {
    type: String,
    unique: true,
  },
  date_of_birth: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Nam", "Nữ", "other"],
  },
  phoneNumber: {
    type: String,
  },
  cv_link: {
    type: String,
  },
  address: {
    type: String,
  },
});

// Đăng ký tài khoản
router.post("/user/signup", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // Kiểm tra username đã được sử dụng chưa
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).send("username đã được sử dụng");
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Tạo tài khoản mới
    const newUser = new User({
      username,
      password: hash,
      email,
      role,
    });

    // Lưu vào cơ sở dữ liệu
    const insert = await newUser.save();

    // Trả về token cho client
    const token = jwt.sign({ username }, "mysecretkey");
    return res.json({
      message: "User registered successfully",
      userId: insert._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

// Đăng nhập
router.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("username hoặc mật khẩu không đúng");
    }

    // Kiểm tra mật khẩu
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("username hoặc mật khẩu không đúng");
    }

    // Trả về token cho client
    const token = jwt.sign({ username }, "mysecretkey");
    // console.log(token);
    res.send({ accessToken: token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token.split(" ")[1], "mysecretkey", (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Lưu thông tin người dùng trong đối tượng req
    req.user = decoded;
    next();
  });
};

router.get("/getalluser", async (req, res) => {
  try {
    const { query } = req;
    const user = await User.find(query);
    res.status(200).send(user);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("Lỗi server");
  }
});

// GetUser By Id
router.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// CRUD: Lấy thông tin người dùng
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user; // Lấy thông tin người dùng từ xác thực
    // console.log(username);
    const user = await User.find({ username });

    // Trả về thông tin người dùng
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// CRUD: Cập nhật thông tin người dùng
router.put("/user", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;
    const user = await User.findOneAndUpdate({ username }, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/change-password", authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Tìm người dùng trong cơ sở dữ liệu
  User.findOne({ username: req.user.username }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // So sánh mật khẩu hiện tại
    bcrypt.compare(currentPassword, user.password, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (!result) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      // Mã hóa mật khẩu mới
      bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Cập nhật mật khẩu mới
        user.password = hashedPassword;
        user.save((err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.status(200).json({ message: "Password changed successfully" });
        });
      });
    });
  });
});
export default router;
