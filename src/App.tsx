import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import BrowseCourses from './pages/dashboard/BrowseCourses';
import LecturerDashboard from './pages/dashboard/LecturerDashboard';
import CourseDetailLecturer from './pages/dashboard/CourseDetailLecturer';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CourseDetailStudent from './pages/dashboard/CourseDetailStudent';
import QuizTaker from './pages/dashboard/QuizTaker';
import CreateQuiz from './pages/dashboard/CreateQuiz';
import VRExperience from './pages/VRExperience';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard/student" element={<StudentDashboard />} />
          <Route path="dashboard/student/browse" element={<BrowseCourses />} />
          <Route path="dashboard/lecturer" element={<LecturerDashboard />} />
          <Route path="dashboard/lecturer/course/:courseId" element={<CourseDetailLecturer />} />
          <Route path="dashboard/lecturer/course/:courseId/quiz/:simId/create" element={<CreateQuiz />} />
          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="course/:courseId" element={<CourseDetailStudent />} />
          <Route path="quiz/:quizId" element={<QuizTaker />} />
          <Route path="vr-experience" element={<VRExperience />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
