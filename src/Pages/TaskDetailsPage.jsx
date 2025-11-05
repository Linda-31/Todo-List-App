import React from "react";
import { useLocation } from "react-router-dom";
import "../Styles/style.css";

function TaskDetailsPage() {
  const location = useLocation();
  const task = location.state?.task; 

  if (!task) {
    return (
      <div className="task-details-container">
        <h2 className="task-details-notfound">⚠️ Task not found</h2>
      </div>
    );
  }

  return (
    <div className="task-details-container">
      <div className="task-details-card">
        <h2 className="task-details-heading">🗂 Task Details</h2>
        <p><b>ID:</b> {task.id}</p>
        <p><b>Title:</b> {task.title}</p>
        <p><b>Status:</b> {task.status || "To Do"}</p>
      </div>
    </div>
  );
}

export default TaskDetailsPage;
