import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import VRExperience from './pages/VRExperience';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard/student" element={<StudentDashboard />} />
          <Route path="dashboard/instructor" element={<InstructorDashboard />} />
          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="vr-experience" element={<VRExperience />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
