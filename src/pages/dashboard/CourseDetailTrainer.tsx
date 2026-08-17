import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft, PlayCircle, Users, Plus, X, Search } from 'lucide-react';

const availableSims = [
  { id: 'reception', name: 'Hospital Reception' },
  { id: 'er',        name: 'Emergency Room' },
  { id: 'ward',      name: 'Patient Ward' },
  { id: 'cpr',       name: 'CPR Training' },
  { id: 'or',        name: 'Operating Room' },
  { id: 'radiology', name: 'Radiology (CT-Scan)' },
  { id: 'ambulance', name: 'Ambulance Unit' },
];

export default function CourseDetailTrainer() {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  
  const [course, setCourse] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<any[]>([]);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [answersLoading, setAnswersLoading] = useState(false);
  
  const [showSimModal, setShowSimModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const fetchCourse = async () => {
    try {
      const [resCourse, resResults, resProgress] = await Promise.all([
        fetch(`http://localhost:5000/api/courses/${courseId}`, { headers: { 'Authorization': `Bearer ${user?.token}` } }),
        fetch(`http://localhost:5000/api/quizzes/course/${courseId}/results`, { headers: { 'Authorization': `Bearer ${user?.token}` } }),
        fetch(`http://localhost:5000/api/courses/${courseId}/students-progress`, { headers: { 'Authorization': `Bearer ${user?.token}` } })
      ]);
      if (resCourse.ok) setCourse(await resCourse.json());
      if (resResults.ok) setQuizResults(await resResults.json());
      if (resProgress.ok) setStudentProgress(await resProgress.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/students`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setStudentsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchStudents();
  }, [courseId, user?.token]);

  const handleShowAnswers = async (quizId: string, title?: string) => {
    setAnswersLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/answers`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch answers');
      const data = await res.json();
      setSelectedQuizAnswers(data.questions || []);
      setSelectedQuizTitle(title || data.title || 'Quiz Answers');
      setShowAnswersModal(true);
    } catch (err) {
      console.error(err);
      alert('Unable to load answers');
    } finally {
      setAnswersLoading(false);
    }
  };

  const updateCourse = async (updates: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` 
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchCourse();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSim = (simId: string) => {
    if (!course.simulations.includes(simId)) {
      updateCourse({ simulations: [...course.simulations, simId] });
    }
    setShowSimModal(false);
  };

  const handleRemoveSim = (simId: string) => {
    updateCourse({ simulations: course.simulations.filter((s: string) => s !== simId) });
  };

  const handleEnrollStudent = (studentId: string) => {
    const existingStudentIds = course.students.map((s: any) => s._id || s);
    if (!existingStudentIds.includes(studentId)) {
      updateCourse({ students: [...existingStudentIds, studentId] });
    }
  };

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
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Link to="/dashboard/trainer" className="text-sky-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Filter out students already enrolled
  const unenrolledStudents = studentsList.filter(
    (s) => !course.students.find((cs: any) => (cs._id || cs) === s._id)
  );

  // Filter based on search
  const filteredUnenrolled = unenrolledStudents.filter(
    (s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
           s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Link to="/dashboard/trainer" className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{course.title}</h1>
            <p className="text-slate-400 mt-1">{course.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Simulations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-sky-400" /> Assigned Simulations
                </h2>
                <p className="text-slate-400 text-sm mt-1">Manage the VR modules available to students in this course.</p>
              </div>
              <button 
                onClick={() => setShowSimModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
              >
                <Plus className="w-4 h-4" /> Add Sim
              </button>
            </div>

            <div className="space-y-4">
              {course.simulations.map((sim: string, idx: number) => {
                const simDetails = availableSims.find(s => s.id === sim) || { name: sim };
                return (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-slate-700 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🥽</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white capitalize">{simDetails.name}</h3>
                        <p className="text-sm text-slate-400">Standard VR Environment</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        to={`/dashboard/trainer/course/${courseId}/quiz/${sim}/create`}
                        className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center"
                      >
                        Create Quiz
                      </Link>
                      <button 
                        onClick={() => handleRemoveSim(sim)}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              {course.simulations.length === 0 && (
                <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
                  <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No simulations assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Students */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Enrolled Students
                </h2>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md">
                  {course.students.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {course.students.length > 0 ? (
                  course.students.map((student: any, idx: number) => {
                    const prog = studentProgress.find(p => p.studentId === student._id);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                            {(student.name || 'S').charAt(0)}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-slate-200 text-sm font-medium truncate">{student.name || student}</span>
                            {student.email && <span className="text-slate-500 text-xs truncate">{student.email}</span>}
                          </div>
                        </div>
                        {prog && (
                          <div className="text-right shrink-0">
                            {prog.isFinished ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 italic tracking-wider">Done</span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400 bg-slate-700/30 px-2 py-1 rounded border border-slate-700/50">{prog.progressPercentage}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No students enrolled yet.</p>
                )}
              </div>
              
              <button 
                onClick={() => setShowStudentModal(true)}
                className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition"
              >
                <Plus className="w-4 h-4" /> Enroll Student
              </button>
            </div>

            {/* Quiz Results Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-emerald-400">📊</span> Student Quiz Marks
              </h2>
              
              {quizResults.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {quizResults.map((result: any, idx: number) => {
                    const percentage = Math.round((result.score / result.total) * 100);
                    const isPass = percentage >= 50;
                    return (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between hover:border-slate-600 transition">
                        <div className="overflow-hidden pr-2">
                          <p className="text-white font-medium truncate">{result.student?.name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-400 mt-1 truncate">{result.quiz?.title || 'Unknown Quiz'} ({result.quiz?.simulation})</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-lg font-bold ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result.score} / {result.total}
                          </p>
                          <p className="text-xs text-slate-500">{percentage}%</p>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleShowAnswers(result.quiz?._id || result.quiz)}
                              disabled={answersLoading}
                              className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md text-slate-300 border border-slate-700/50 transition"
                            >
                              {answersLoading ? 'Loading…' : 'Reveal Answers'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-6">No students have taken any quizzes yet.</p>
              )}
            </div>

          </div>
          
        </div>
      </div>

      {/* Add Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowSimModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Available Simulations</h2>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {availableSims.map(sim => (
                <div key={sim.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-sky-500/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🥽</span>
                    <span className="text-slate-200 font-medium">{sim.name}</span>
                  </div>
                  {course.simulations.includes(sim.id) ? (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Added</span>
                  ) : (
                    <button 
                      onClick={() => handleAddSim(sim.id)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1.5 rounded-lg text-sm font-bold transition"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowStudentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Enroll Student</h2>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
              />
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {filteredUnenrolled.map(student => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium text-sm">{student.name}</span>
                    <span className="text-slate-500 text-xs">{student.email}</span>
                  </div>
                  <button 
                    onClick={() => handleEnrollStudent(student._id)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    Enroll
                  </button>
                </div>
              ))}
              {filteredUnenrolled.length === 0 && (
                <p className="text-center text-slate-500 py-4 text-sm">No students found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reveal Answers Modal */}
      {showAnswersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl shadow-2xl relative">
            <button onClick={() => setShowAnswersModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Correct Answers — {selectedQuizTitle}</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {selectedQuizAnswers.length === 0 ? (
                <p className="text-slate-400">No questions found.</p>
              ) : (
                selectedQuizAnswers.map((q: any, i: number) => (
                  <div key={i} className="bg-slate-800/40 border border-slate-700 p-4 rounded-lg">
                    <p className="text-slate-200 font-medium">{i + 1}. {q.questionText}</p>
                    <ul className="mt-2 space-y-2 pl-4 list-disc">
                      {q.options.map((opt: string, idx: number) => (
                        <li key={idx} className={`${idx === q.correctOptionIndex ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
                          {opt} {idx === q.correctOptionIndex && <span className="text-xs text-emerald-300 ml-2">(Correct)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
