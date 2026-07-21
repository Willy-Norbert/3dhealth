import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Clock, Trophy, Activity, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  lecturer: { name: string };
  simulations: string[];
}

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCourses, resProgress, resQuizzes] = await Promise.all([
          fetch('http://localhost:5000/api/courses', { headers: { 'Authorization': `Bearer ${user?.token}` } }),
          fetch('http://localhost:5000/api/progress', { headers: { 'Authorization': `Bearer ${user?.token}` } }),
          fetch('http://localhost:5000/api/quizzes/my-results', { headers: { 'Authorization': `Bearer ${user?.token}` } })
        ]);

        if (resCourses.ok) setCourses(await resCourses.json());
        if (resProgress.ok) setProgress(await resProgress.json());
        if (resQuizzes.ok) setQuizResults(await resQuizzes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Calculate Progress Stats
  const totalSeconds = progress.reduce((acc, p) => acc + (p.timeSpentSeconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  let avgScore = 0;
  if (quizResults.length > 0) {
    const totalPercent = quizResults.reduce((acc, q) => acc + ((q.score / q.total) * 100), 0);
    avgScore = Math.round(totalPercent / quizResults.length);
  }

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
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Student Dashboard</h1>
            <p className="text-slate-400 mt-2 text-lg">Welcome back, {user?.name}. Here is your learning overview.</p>
          </div>
          <Link 
            to="/dashboard/student/browse" 
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.2)] flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" /> Browse New Courses
          </Link>
        </div>

        {/* Progress Analytics */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* VR Time Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Clock className="w-24 h-24 text-sky-400" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Time in VR</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">{hours}</span>
                  <span className="text-slate-500 mb-1 font-medium">hrs</span>
                  <span className="text-4xl font-black text-white ml-2">{minutes}</span>
                  <span className="text-slate-500 mb-1 font-medium">mins</span>
                </div>
                <p className="text-sky-400 text-sm mt-4 font-medium flex items-center gap-1">
                  Across {progress.length} simulations
                </p>
              </div>
            </div>

            {/* Quiz Average Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Trophy className="w-24 h-24 text-emerald-400" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Average Quiz Score</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">{avgScore}</span>
                  <span className="text-2xl font-bold text-slate-500 mb-1">%</span>
                </div>
                <p className="text-emerald-400 text-sm mt-4 font-medium flex items-center gap-1">
                  Based on {quizResults.length} quizzes taken
                </p>
              </div>
            </div>

            {/* Enrolled Courses Stat */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <BookOpen className="w-24 h-24 text-purple-400" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Active Courses</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">{courses.length}</span>
                </div>
                <p className="text-purple-400 text-sm mt-4 font-medium flex items-center gap-1">
                  Keep up the good work!
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Enrolled Courses List */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" /> My Courses
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl py-12">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No courses enrolled</h3>
                <p className="text-slate-500 mb-6">You haven't joined any courses yet. Explore available courses to get started.</p>
                <Link to="/dashboard/student/browse" className="text-sky-400 hover:text-sky-300 font-medium">
                  Browse Courses &rarr;
                </Link>
              </div>
            ) : (
              courses.map(course => (
                <div key={course._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition group">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-full font-medium">
                      {course.simulations.length} Simulations
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                        {(course.lecturer?.name || 'L').charAt(0).toUpperCase()}
                      </span>
                      {course.lecturer?.name || 'Unknown Lecturer'}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-800">
                    <Link 
                      to={`/course/${course._id}`} 
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      Enter Course <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
