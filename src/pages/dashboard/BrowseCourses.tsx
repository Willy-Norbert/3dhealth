import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { BookOpen, Users, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  description: string;
  simulations: string[];
  students: any[];
  lecturer: { name: string };
}

export default function BrowseCourses() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAvailableCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses/available', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCourses();
  }, [user?.token]);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (res.ok) {
        // Redirect to student dashboard to see the new course
        navigate('/dashboard/student');
      }
    } catch (err) {
      console.error(err);
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Available Courses</h1>
          <p className="text-slate-400 mt-1">Browse and enroll in new courses to expand your knowledge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition group">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full">
                  {course.simulations.length} Simulations
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
                <p className="text-xs text-slate-500 mt-2">Lecturer: <span className="text-slate-300">{course.lecturer?.name || 'Unknown'}</span></p>
              </div>
              
              <div className="mt-auto pt-6 flex justify-between items-center text-sm border-t border-slate-800">
                <span className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4 text-emerald-400"/> 
                  {course.students.length} Enrolled
                </span>
                
                <button 
                  onClick={() => handleEnroll(course._id)}
                  disabled={enrolling === course._id}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  {enrolling === course._id ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No courses available</h3>
              <p className="text-slate-500 max-w-md mx-auto">You have enrolled in all available courses, or none have been published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
