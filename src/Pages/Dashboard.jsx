import React, { useEffect, useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../UserContext/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_BASE = "http://localhost:5000/api";

const TaskCard = memo(({ task, onEdit, onDelete, hideTitle, index, isDraggable }) => {
  if (!isDraggable) {
    return (
      <div className="task-card">
        {!hideTitle && (
          <Link to={`/tasks/${task.id}`} state={{ task }}>
            <h3>{task.title}</h3>
          </Link>
        )}
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="edit-btn"><MdEdit /></button>
          <button onClick={() => onDelete(task.id)} className="delete-btn"><MdDelete /></button>
        </div>
      </div>
    );
  }


  return (

    <Draggable draggableId={String(task.id)} index={index}>
      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {!hideTitle && (
            <Link to={`/tasks/${task.id}`} state={{ task }}>
              <h3>{task.title}</h3>
            </Link>
          )}
          <div className="task-actions">
            <button onClick={() => onEdit(task)} className="edit-btn"><MdEdit /></button>
            <button onClick={() => onDelete(task.id)} className="delete-btn"><MdDelete /></button>
          </div>
        </div>
      )}
    </Draggable>
  );
});


export default function Dashboard() {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("board");
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchTasks = useCallback(async () => {
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tasks");
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onSubmit = async (formData) => {
    try {
      let result;
      if (editingTask) {
        const res = await fetch(`${API_BASE}/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            title: formData.title,
            status: formData.status,
          }),
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.message || "Failed to update task");
        result = updated;
        setTasks((prev) =>
          prev.map((t) => (t.id === result.id ? result : t))
        );
      } else {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: formData.title,
            status: formData.status,
          }),
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created.message || "Failed to create task");
        result = created;
        setTasks((prev) => [...prev, result]);
      }
      reset();
      setEditingTask(null);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };


  const handleDelete = useCallback(async (id) => {
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const obj = await res.json();
      if (!res.ok) throw new Error(obj.message || "Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }, [token]);
  const handleEdit = useCallback(
    (task) => {
      setEditingTask(task);
      reset(task);
      setShowModal(true);
    },
    [reset]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;


    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;


    const movedTaskId = Number(draggableId);
    const newStatus = destination.droppableId;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === movedTaskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await fetch(`${API_BASE}/tasks/${movedTaskId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>⚠️ Error: {error}</p>
        <button onClick={fetchTasks}>Retry</button>
      </div>
    );
  }

  const statuses = ["To Do", "In Progress", "Done"];
  const statusImages = {
    "To Do": "/images/image3.png",
    "In Progress": "/images/image5.png",
    "Done": "/images/image1.png",
  };

  return (
    <>

      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <div className="container-fluid">

          <a className="navbar-brand d-flex align-items-center" href="/tasks">
            <img src="/images/logo1.png" alt="Logo" width="40" height="40" className="me-2 ms-3 rounded-circle" />
            <h1 className="me-2">Task Management</h1>
          </a>


          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ borderColor: "white" }}
          >
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
          </button>


          <div className="collapse navbar-collapse" id="navbarContent">
            <div className="navbar-nav me-auto mb-2 mb-lg-0">

              <button
                className={`nav-btn me-3 ${viewMode === "board" ? "active" : ""}`}
                onClick={() => setViewMode("board")}
              >
                Board
              </button>
              <button
                className={`nav-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                Table
              </button>
            </div>

            <div className="d-flex align-items-center">

              <button
                className="add-btn me-4"
                onClick={() => {
                  setShowModal(true);
                  reset();
                }}
              >
                Add Task
              </button>


              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="Profile"
                className="rounded-circle me-4"
                width="40"
                height="40"
              />


              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-container container-fluid py-3">
        {viewMode === "board" ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="row g-4 board">
              {statuses.map((status) => (
                <div
                  className="col-12 col-sm-6 col-md-6 col-lg-3 me-4"
                  key={status}
                >
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        className="board-column shadow-sm h-100"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="card-body text-center">
                          <h5 className="card-title mb-3">{status}</h5>
                          <img
                            src={statusImages[status]}
                            alt={`${status} icon`}
                            className="img-fluid mb-3"
                            style={{
                              maxWidth: "100px",
                              height: "auto",
                            }}
                          />
                          <div className="task-list text-start">
                            {tasks
                              .filter((t) => (t.status || "To Do") === status)
                              .map((task, index) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  index={index}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  isDraggable={viewMode === "board"}
                                />
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="list-view table-responsive mt-4">
            <table className="table table-striped align-middle">
              <thead >
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <Link to={`/tasks/${task.id}`} state={{ task }}>
                        {task.title}
                      </Link>
                    </td>
                    <td>{task.status || "To Do"}</td>
                    <td>
                      <TaskCard
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        hideTitle={true}
                        isDraggable={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay d-flex justify-content-center align-items-center">
            <div className="modal-box">
              <h2 className="mb-3 text-center">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <div className="text-danger small">{errors.title.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label>Status</label>
                  <select
                    className="form-select"
                    {...register("status", { required: "Status is required" })}
                  >
                    <option value="">Select...</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <div className="text-danger small">{errors.status.message}</div>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTask(null);
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingTask ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
