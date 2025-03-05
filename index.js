// node modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//middlewares
const auth = require("./middlewares/authMiddleware");

// services
const userService = require("./services/userService");
const taskService = require("./services/taskService");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  try {
    res.sendFile(__dirname + "/templates/index.html");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// user routes
app.get("/users/:id", userService.getUserById); 
app.post("/users/register", userService.register);
app.post("/users/login", userService.login);

// task routes
app.get("/tasks/getAssignedTasks", auth,  taskService.getAssignedTasks);
app.get("/tasks/getCreatedTasks", auth, taskService.getCreatedTasks);
app.get("/tasks/:id", auth, taskService.getById);
app.post("/tasks", auth, taskService.createTask);
app.put("/tasks/updateTaskStatus/:id/:status", auth, taskService.changeTaskStatus);
app.put("/tasks/:id", auth, taskService.updateTask);
app.delete("/tasks/deleteTask/:id", auth, taskService.deleteTask);

app.listen(port, () => console.log(`Server running on port ${port}`));
