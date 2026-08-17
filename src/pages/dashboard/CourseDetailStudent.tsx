import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PlayCircle, FileText, ArrowLeft, BookOpen, Lock } from 'lucide-react';

const availableSims = [
  { id: 'reception', name: 'Hospital Reception' },
  { id: 'er',        name: 'Emergency Room' },
  { id: 'ward',      name: 'Patient Ward' },
  { id: 'cpr',       name: 'CPR Training' },
  { id: 'or',        name: 'Operating Room' },
  { id: 'radiology', name: 'Radiology (CT-Scan)' },
  { id: 'ambulance', name: 'Ambulance Unit' },
];

export default function CourseDetailStudent() {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  const [course, setCourse] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which simulations have been launched (persisted in localStorage)
  const launchedKey = `launched_sims_${courseId}_${user?._id}`;
  const [launchedSims, setLaunchedSims] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`launched_sims_${courseId}_${user?._id}`);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`launched_sims_${courseId}_${user?._id}`);
      setLaunchedSims(new Set(saved ? JSON.parse(saved) : []));
    } catch {
      setLaunchedSims(new Set());
    }
  }, [courseId, user?._id]);

  const markSimLaunched = (simId: string) => {
    setLaunchedSims(prev => {
      const next = new Set(prev);
      next.add(simId);
      try { localStorage.setItem(launchedKey, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}/student-dashboard-details`, {
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          setQuizzes(data.quizzes);
          setQuizResults(data.quizResults);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId, user?.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found or access denied.</h2>
          <Link to="/dashboard/student" className="text-sky-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizResults.length;
  const totalQuizScore = quizResults.reduce((sum, r) => sum + r.score, 0);
  const totalPossibleScore = quizResults.reduce((sum, r) => sum + r.total, 0);
  const averagePercentage = totalPossibleScore > 0 ? Math.round((totalQuizScore / totalPossibleScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-sm pt-8 pb-6 flex items-center justify-between border-b border-slate-800 relative shadow-sm">
          <div className="flex items-start gap-4">
            <Link to="/dashboard/student" className="mt-1 p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">{course.title}</h1>
              <p className="text-lg text-slate-400 mt-2">{course.description}</p>
              <p className="text-sm font-medium text-slate-500 mt-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white">
                  {(course.trainer?.name || 'L').charAt(0).toUpperCase()}
                </span>
                Trainer: <span className="text-slate-300">{course.trainer?.name || 'Unknown'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Course Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Score Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <span className="text-4xl">🏆</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium italic tracking-wider mb-1">Course Grade Average</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">{averagePercentage}%</span>
              </div>
              <p className="text-emerald-400 text-xs mt-2 font-medium">Automatic performance grade</p>
            </div>
          </div>

          {/* Quizzes Completed Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <span className="text-4xl">📝</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium italic tracking-wider mb-1">Quizzes Completed</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">{completedQuizzes} <span className="text-slate-500 text-lg">/ {totalQuizzes}</span></span>
              </div>
              <p className="text-sky-400 text-xs mt-2 font-medium">{totalQuizzes - completedQuizzes} remaining quizzes</p>
            </div>
          </div>

          {/* Total Marks Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <span className="text-4xl">📊</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium italic tracking-wider mb-1">Total Marks Earned</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">{totalQuizScore} <span className="text-slate-500 text-lg">/ {totalPossibleScore}</span></span>
              </div>
              <p className="text-purple-400 text-xs mt-2 font-medium">Accumulated quiz points</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-sky-400" /> Course Materials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.simulations.map((sim: string) => {
              const relatedQuiz = quizzes.find(q => q.simulation === sim);
              const simDetails = availableSims.find(s => s.id === sim) || { name: sim };
              
              return (
                <div key={sim} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4 hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition group">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🥽</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white capitalize">{simDetails.name}</h3>
                      <p className="text-xs text-slate-400">Interactive VR Module</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3 pt-2">
                    <Link 
                      to={`/vr-experience?sim=${sim}&courseId=${courseId}`} 
                      onClick={() => markSimLaunched(sim)}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-3 rounded-xl flex justify-center items-center gap-2 transition shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                    >
                      <PlayCircle className="w-5 h-5" /> Launch Simulation
                    </Link>
                    
                    {relatedQuiz ? (() => {
                      const quizResultObj = quizResults.find(r => (r.quiz?._id || r.quiz) === relatedQuiz._id);
                      if (quizResultObj) {
                        return (
                          <div className="w-full space-y-2">
                            <button 
                              disabled
                              className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex justify-center items-center gap-2 font-bold cursor-not-allowed opacity-80"
                            >
                              <FileText className="w-5 h-5" /> Quiz Completed
                            </button>
                            <p className="text-center text-xs text-emerald-500/80 font-medium">
                              Score: {quizResultObj.score} / {quizResultObj.total} ({Math.round((quizResultObj.score / quizResultObj.total) * 100)}%)
                            </p>
                          </div>
                        );
                      }
                      // Only show quiz button if the student has launched the simulation
                      if (!launchedSims.has(sim)) {
                        return (
                          <div className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-500 px-4 py-3 rounded-xl flex justify-center items-center gap-2 text-sm" title="Launch the simulation first to unlock the quiz">
                            <Lock className="w-4 h-4" /> unlock quiz by launching the simulation
                          </div>
                        );
                      }
                      return (
                        <Link 
                          to={`/quiz/${relatedQuiz._id}?courseId=${courseId}`} 
                          className="w-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 px-4 py-3 rounded-xl flex justify-center items-center gap-2 font-bold transition"
                        >
                          <FileText className="w-5 h-5" /> Take Knowledge Quiz
                        </Link>
                      );
                    })() : (
                      <div className="w-full bg-slate-800/50 text-slate-500 px-4 py-3 rounded-xl flex justify-center items-center gap-2 text-sm">
                        No quiz available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {course.simulations.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
                <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">No materials yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">Your trainer hasn't added any VR simulations to this course yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
