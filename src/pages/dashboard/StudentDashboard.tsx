import { Link } from 'react-router-dom';
import { Activity, BookOpen, Clock, PlayCircle } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500">Welcome back, Dr. Smith. Here's your training progress.</p>
        </div>
        <Link to="/vr-experience" className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <PlayCircle className="w-5 h-5" /> Start Training
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Assigned Modules</p>
            <h3 className="text-2xl font-bold text-gray-900">4</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Simulations</p>
            <h3 className="text-2xl font-bold text-gray-900">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Hours in VR</p>
            <h3 className="text-2xl font-bold text-gray-900">24.5h</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">CPR Procedure {i}</h4>
                  <p className="text-sm text-gray-500">Completed with 9{i}% accuracy</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">2 days ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dummy Stethoscope for the loop
import { Stethoscope as StethoscopeIcon } from 'lucide-react';
const Stethoscope = StethoscopeIcon;
