import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { BookOpen, Users, PlusCircle, Settings, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  description: string;
  simulations: string[];
  students: any[];
}

export default function TrainerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ title, description, simulations: ['default-vr-room'] })
      });
      if (res.ok) {
        setIsCreating(false);
        setTitle('');
        setDescription('');
        fetchCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Trainer Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome, {user?.name}. Manage your courses and students.</p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            <PlusCircle className="w-5 h-5" /> {isCreating ? 'Cancel' : 'New Course'}
          </button>
        </div>

        {isCreating && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
            <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-6 relative z-10 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  placeholder="e.g. Advanced Anatomy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition min-h-[120px]"
                  placeholder="Course description..."
                />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Save Course
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition group">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" />
                  {course.simulations.length} Simulations
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
              </div>
              <div className="mt-auto pt-6 flex justify-between items-center text-sm text-slate-400">
                <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4 text-emerald-400"/> 
                  <span className="text-slate-300 font-medium">{course.students.length} Enrolled</span>
                </span>
                <Link 
                  to={`/dashboard/trainer/course/${course._id}`}
                  className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium hover:bg-sky-500/10 px-4 py-2 rounded-lg transition"
                >
                  <Settings className="w-4 h-4" /> Manage
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && !isCreating && (
            <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No courses yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">You haven't created any courses. Click 'New Course' to get started and assign VR simulations to your students.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
