import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export default function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const [resQuiz, resResults] = await Promise.all([
          fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          }),
          fetch(`http://localhost:5000/api/quizzes/my-results`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          })
        ]);

        if (resQuiz.ok) {
          const data = await resQuiz.json();
          setQuiz(data);
          setAnswers(new Array(data.questions.length).fill(-1));
        }

        if (resResults.ok) {
          const resultsData = await resResults.json();
          const existingResult = resultsData.find((r: any) => (r.quiz._id || r.quiz) === quizId);
          if (existingResult) {
            setScore(existingResult.score);
            setSubmitted(true);
            setAlreadyTaken(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, user?.token]);

  const handleSubmit = async () => {
    if (answers.includes(-1)) {
      alert("Please answer all questions.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        const result = await res.json();
        setScore(result.score);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Quiz not found</h2>
          <Link to="/dashboard/student" className="text-emerald-400 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 p-8 max-w-2xl w-full rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center space-y-6 relative overflow-hidden">
          
          {/* Decorative background circle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-4xl font-bold text-white tracking-tight">
            {alreadyTaken ? 'Quiz Already Completed' : 'Quiz Completed!'}
          </h2>
          <p className="text-slate-400">
            {alreadyTaken ? (
              <>You have previously submitted answers for <strong className="text-slate-300">{quiz.title}</strong>.</>
            ) : (
              <>You've successfully submitted your answers for <strong className="text-slate-300">{quiz.title}</strong>.</>
            )}
          </p>
          
          <div className="py-8">
            <div className="inline-flex items-end gap-2">
              <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 leading-none">
                {score}
              </span>
              <span className="text-2xl font-bold text-slate-500 mb-2">/ {quiz.questions.length}</span>
            </div>
            <p className="text-emerald-500/80 font-medium mt-2">{percentage}% Score</p>
          </div>

          <button 
            onClick={() => navigate('/dashboard/student')} 
            className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] inline-flex items-center gap-2"
          >
            Return to Dashboard <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3 text-emerald-500 font-bold mb-2 text-sm uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Knowledge Assessment</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{quiz.title}</h1>
            <p className="text-slate-400 mt-1 capitalize">Simulation Context: {quiz.simulation?.replace('-', ' ')}</p>
          </div>
          
          <Link to="/dashboard/student" className="shrink-0 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((q: any, i: number) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:border-slate-700 transition duration-300">
              <h3 className="text-xl font-bold text-white mb-6 flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/20 mt-0.5">
                  {i + 1}
                </span>
                {q.questionText}
              </h3>
              
              <div className="space-y-3 pl-12">
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[i] === optIdx;
                  return (
                    <label 
                      key={optIdx} 
                      className={`
                        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border
                        ${isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                        }
                      `}
                    >
                      <div className={`
                        shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-600 text-transparent'}
                      `}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />}
                      </div>
                      <span className={`${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {opt}
                      </span>
                      
                      {/* Hidden radio input */}
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={isSelected}
                        onChange={() => {
                          const newAnswers = [...answers];
                          newAnswers[i] = optIdx;
                          setAnswers(newAnswers);
                        }}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-8">
          <button 
            onClick={handleSubmit} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
          >
            Submit All Answers <CheckCircle2 className="w-6 h-6" />
          </button>
          
          <p className="text-center text-slate-500 text-sm mt-4">
            Make sure to double check your answers before submitting.
          </p>
        </div>
        
      </div>
    </div>
  );
}
