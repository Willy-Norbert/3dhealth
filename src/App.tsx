import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import BrowseCourses from './pages/dashboard/BrowseCourses';
import TrainerDashboard from './pages/dashboard/TrainerDashboard';
import CourseDetailTrainer from './pages/dashboard/CourseDetailTrainer';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CourseDetailStudent from './pages/dashboard/CourseDetailStudent';
import QuizTaker from './pages/dashboard/QuizTaker';
import CreateQuiz from './pages/dashboard/CreateQuiz';
import VRExperience from './pages/VRExperience';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="dashboard/student" element={<StudentDashboard />} />
          <Route path="dashboard/student/browse" element={<BrowseCourses />} />
          <Route path="dashboard/trainer" element={<TrainerDashboard />} />
          <Route path="dashboard/trainercourse/:courseId" element={<CourseDetailTrainer />} />
          <Route path="dashboard/trainercourse/:courseId/quiz/:simId/create" element={<CreateQuiz />} />
          {/* legacy/alternate paths (some links use /dashboard/trainer/course/...) */}
          <Route path="dashboard/trainer/course/:courseId" element={<CourseDetailTrainer />} />
          <Route path="dashboard/trainer/course/:courseId/quiz/:simId/create" element={<CreateQuiz />} />
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
