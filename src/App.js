import { Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import TaskDetailsPage from './Pages/TaskDetailsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks" element={<Dashboard />} />
      <Route path="/tasks/:id" element={<TaskDetailsPage />} />
    </Routes>
  );
}

export default App;
