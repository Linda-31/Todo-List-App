import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

let nextId = 1;
const users = [];
const tasks = [];

const SECRET_KEY = "my_super_secret_key";

app.post("/api/auth/signup", async (req, res) => {
  const { name, useremail, password } = req.body;
  const existing = users.find(u => u.useremail === useremail);
  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ name, useremail, password: hashedPassword });
  res.status(201).json({ message: "Signup successful" });
});

app.post("/api/auth/login", async (req, res) => {
  const { useremail, password } = req.body;
  const user = users.find(u => u.useremail === useremail);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ useremail: user.useremail }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token, user: { name: user.name, useremail: user.useremail } });
});


app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title, status } = req.body;
  const newTask = { id: nextId++, title, status: status || "To Do" };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, status } = req.body;
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;
  res.json(task);
});


app.delete("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: "Task not found" });
  }
  tasks.splice(idx, 1);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
