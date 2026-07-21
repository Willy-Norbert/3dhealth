import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export default function CreateQuiz() {
  const { courseId, simId } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQ = [...questions];
    newQ[index].questionText = text;
    setQuestions(newQ);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = text;
    setQuestions(newQ);
  };

  const updateCorrectOption = (qIndex: number, oIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].correctOptionIndex = oIndex;
    setQuestions(newQ);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }
    
    // Basic validation
    for (const q of questions) {
      if (!q.questionText.trim()) {
        setError('All questions must have text');
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError('All options must have text');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          title,
          courseId,
          simulation: simId,
          questions
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create quiz');
      }

      navigate(`/dashboard/lecturer/course/${courseId}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Link to={`/dashboard/lecturer/course/${courseId}`} className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Quiz</h1>
            <p className="text-slate-400 mt-1 capitalize">For {simId?.replace('-', ' ')} Simulation</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="e.g. Post-Op Procedures Knowledge Check"
            />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative group transition hover:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                    {qIndex + 1}
                  </span>
                  Question Details
                </h3>
                {questions.length > 1 && (
                  <button 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="Enter your question here..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button 
                        onClick={() => updateCorrectOption(qIndex, oIndex)}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          q.correctOptionIndex === oIndex 
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                            : 'border-slate-600 hover:border-slate-500 text-transparent'
                        }`}
                        title="Mark as correct answer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                        className={`flex-1 bg-slate-800/50 border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm ${
                          q.correctOptionIndex === oIndex ? 'border-emerald-500/50' : 'border-slate-700'
                        }`}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <button 
            onClick={handleAddQuestion}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition"
          >
            <Plus className="w-5 h-5" /> Add Another Question
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3 rounded-xl flex items-center gap-2 font-bold transition shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>

      </div>
    </div>
  );
}
