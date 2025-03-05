require("dotenv").config();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    try {
      const { user_name, email, password } = req.body;

      // check if the user already exists
      const userCheck = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: "user already exists" });
      }

      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const newUser = await pool.query(
        "INSERT INTO users (user_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_name, email, hashedPassword, "user"]
      );

      const token = jwt.sign(
        {
          userId: newUser.rows[0].id,
          user_name: newUser.rows[0].user_name,
          email: newUser.rows[0].email,
          role: newUser.rows[0].role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password "});
      }

      const user = userResult.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" })
      }

      const token = jwt.sign(
        {
          userId: user.id,
          user_name: user.user_name,
          email: user.email,
          role: user.role
        },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      )
      
      res.json({ message: "Login Successful", token });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;

      const user = await pool.query('SELECT users.user_name FROM users WHERE id = $1', [userId]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "Could not find user with this id" });
      }

      return res.status(200).json(user.rows[0]);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
};
