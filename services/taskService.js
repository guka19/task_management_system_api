const { query } = require("express");
const pool = require("../db");

module.exports = {
    getAssignedTasks: async (req, res)  => {
        try {
            const tasks = await pool.query('SELECT * FROM tasks WHERE assigned_to = $1', [req.user.userId]);
            res.status(200).json(tasks.rows);
        } catch (err) { 
            console.log(err);
            res.status(500).json(err);
        }
    },

    getCreatedTasks: async (req, res) => {
        try {
            const tasks = await pool.query('SELECT * FROM tasks WHERE created_by = $1', [req.user.userId]);
            res.status(200).json(tasks.rows);
            console.log(req.user);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },    

    getById: async (req, res) => {
        const taskId = req.params.id;

        if (!taskId) { 
            return res.status(400).json({ error: "Task id is required" });
        }
        try {
            const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
            
            if (task.rows[0].assigned_to != req.user.userId && task.rows[0].created_by != req.user.userId && req.user.role != "admin") { 
                return res.status(403).json({ error: "Not authorized to update this task" });
            }

            if (task.rows.length === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            res.status(200).json(task.rows[0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ err: "An error occured while fetching the task" });
        }
    },

    createTask: async (req, res) => {
        const task = req.body;
        if (!task) {
            return res.status(400).json({ error: "Could not find task in the request body" });
        }

        if (!task.title || !task.description || !task.assigned_to || !task.due_date) {
            return res.status(400).json({ error: "Fill all required fields" });
        }   
        try {
            const result = await pool.query('INSERT INTO tasks (title, description, assigned_to, due_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [task.title, task.description, task.assigned_to, task.due_date, req.user.userId]);
            res.status(201).json({
                message: "Task created",
                task: result.rows[0]
            });
        } catch (err) {
            res.status(500).json({ error: "Error occurred while creating the task" });
        }
    },

    changeTaskStatus: async (req, res) => {
        
        const taskId = req.params.id;
        const status = req.params.status;

        if (!taskId) {
            return res.status(400).json({ error: "Could not find the task id in  the params" });
        }

        const validStatuses = ['pending', 'in_progress', 'completed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status. Status must be one of: pending, in_progress, completed"
            })};
    
        try {
              const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
              if (taskCheck.rows.length === 0) {
                return res.status(404).json({ error: "Task with this id not found" });
              }

              const task = taskCheck.rows[0];
              if (task.assigned_to != req.user.id && task.created_by != req.user.id && req.user.role != "admin") { 
                return res.status(403).json({ error: "Not authorized to update this task" });
              }

              const updatedTask = await pool.query('UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, taskId]);
              res.status(200).json(updatedTask.rows[0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ "message": "Error occured when updating the status of the task" });
        }
    },

    updateTask: async (req, res) => {

        const taskId = req.params.id;
        const newTask = req.body;

        if (!taskId) {
            return res.status(400).json({ error: "Could not find the task id in the params." })
        };

        try {
            const updatedTask = await pool.query('UPDATE tasks SET title = $1, description = $2, due_date = $3, assigned_to = $4, updated_at = NOW() WHERE id = $5 RETURNING *', [newTask.title, newTask.description, newTask.due_date, newTask.assigned_to, taskId])
            res.status(200).json({ message: "Updated successfully", task: updatedTask.rows[0] })
        } catch (err) {
            console.log(err);
            res.status(500).json({error: "Error occured while updating the task"});
        }
    },

    deleteTask: async (req, res) => {

        const taskId = req.params.id;

        if (!taskId) {
            return res.status(400).json({ error: "Could not find task id in the request params" });
        }

        try {
            const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
            if (task.rows.length === 0) {
                return res.stauts(404).json({ error: "Could not find task with this id" });
            }

            
            if (task.rows[0].id != req.user.created_by && task.rows[0].id != req.user.assigned_to && req.user.role != "admin") {
                return res.status(403).json({ error: "You are not authorized to delete this task" });
            }

            const deletedTask = await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
            res.status(200).json({message: "Task is deleted"});
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Error deleting the task" });
        }
    }

}