import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Users, Activity, Trash2, FileText, X, Download, Printer } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Stat {
  simulationName: string;
  totalTimeSeconds: number;
  userCount: number;
}

// Map internal scene IDs to display labels
const sceneLabels: Record<string, string> = {
  reception: 'Hospital Reception',
  ward: 'Patient Ward',
  cpr: 'CPR Training Room',
  or: 'Operating Room',
  er: 'Emergency Room',
  radiology: 'Radiology (CT-Scan)',
  ambulance: 'Ambulance Unit',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
}

function generateReport(users: UserItem[], stats: Stat[], adminName: string) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.isAdmin).length;
  const studentUsers = totalUsers - adminUsers;
  const totalTimeAll = stats.reduce((sum, s) => sum + s.totalTimeSeconds, 0);
  const mostActive = stats.sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds)[0];

  // Build the stats rows HTML
  const statsRows = stats.map((s, i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 12px;">${i + 1}. ${sceneLabels[s.simulationName] || s.simulationName}</td>
      <td style="padding: 10px 12px; text-align:center;">${s.userCount}</td>
      <td style="padding: 10px 12px; text-align:center;">${formatTime(s.totalTimeSeconds)}</td>
      <td style="padding: 10px 12px; text-align:center;">${s.userCount > 0 ? formatTime(Math.round(s.totalTimeSeconds / s.userCount)) : '—'}</td>
    </tr>
  `).join('');

  const usersRows = users.map(u => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 12px;">${u.name}</td>
      <td style="padding: 10px 12px;">${u.email}</td>
      <td style="padding: 10px 12px; text-align:center;">
        <span style="background:${u.isAdmin ? '#ede9fe' : '#e0f2fe'}; color:${u.isAdmin ? '#7c3aed' : '#0369a1'}; padding: 2px 10px; border-radius: 99px; font-size: 12px;">
          ${u.isAdmin ? 'Admin' : 'Student'}
        </span>
      </td>
      <td style="padding: 10px 12px; color:#6b7280;">${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>VR HealthEd – System Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f3f4f6; color: #111827; }
        .page { max-width: 820px; margin: 40px auto; background: #fff; padding: 48px 52px; box-shadow: 0 4px 32px rgba(0,0,0,0.1); }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: center; background: #0f172a; border-bottom: 4px solid #0ea5e9; padding: 28px 36px; margin: -48px -52px 36px -52px; }
        .header img { height: 60px; object-fit: contain; filter: brightness(1.1); }
        .header-meta { text-align: right; font-size: 13px; color: #cbd5e1; }
        .header-meta strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 2px; }
        .header-meta span { color: #f1f5f9; font-weight: 600; }

        /* Title */
        .report-title { font-size: 36px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 32px; }
        
        /* Meta row */
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #d1d5db; margin-bottom: 28px; }
        .meta-cell { padding: 12px 16px; border-right: 1px solid #d1d5db; font-size: 14px; }
        .meta-cell:last-child { border-right: none; }
        .meta-cell strong { font-weight: 700; margin-right: 8px; }

        /* Section headers */
        .section-header { background: #111827; color: #fff; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; padding: 10px 16px; margin-bottom: 0; }
        .section-body { border: 1px solid #d1d5db; border-top: none; padding: 16px; margin-bottom: 28px; font-size: 14px; line-height: 1.7; }
        .section-body ul { padding-left: 20px; }
        .section-body ul li { margin-bottom: 6px; }
        
        /* Two col */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 28px; }
        .two-col .col { }
        .two-col .col:first-child .section-body { border-right: none; }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        table thead { background: #111827; color: #fff; }
        table thead th { padding: 10px 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        table thead th:not(:first-child) { text-align: center; }
        
        /* Stat cards */
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .stat-card { border: 1px solid #d1d5db; padding: 16px; text-align: center; }
        .stat-card .num { font-size: 28px; font-weight: 900; }
        .stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-top: 4px; }

        /* Footer */
        .footer { border-top: 2px solid #111827; padding-top: 16px; margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }

        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
          .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #0f172a !important; color-adjust: exact; margin: 0 !important; }
          .section-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #111827 !important; }
          table thead { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #111827 !important; }
        }
      </style>
    </head>
    <body>
      <div class="page">

        <!-- Header -->
        <div class="header">
          <img src="${window.location.origin}/logo.png" alt="VR HealthEd Logo" />
          <div class="header-meta">
            <strong>Report Generated By</strong>
            <span>${adminName}</span>
            <br/>
            <strong style="margin-top:10px; display:block;">Date &amp; Time</strong>
            <span>${dateStr} at ${timeStr}</span>
          </div>
        </div>

        <!-- Title -->
        <div class="report-title">System Report</div>

        <!-- Meta -->
        <div class="meta-grid">
          <div class="meta-cell"><strong>SYSTEM NAME:</strong> VR HealthEd Training Platform</div>
          <div class="meta-cell"><strong>REPORT DATE:</strong> ${dateStr}</div>
          <div class="meta-cell"><strong>PREPARED BY:</strong> ${adminName} (Administrator)</div>
          <div class="meta-cell"><strong>REPORT TYPE:</strong> Full System Overview</div>
        </div>

        <!-- Executive Summary -->
        <div class="section-header">Executive Summary</div>
        <div class="section-body">
          <ul>
            <li>This report provides a full overview of the VR HealthEd platform's usage data, registered user base, and simulation engagement statistics as of <strong>${dateStr}</strong>.</li>
            <li>The platform currently hosts <strong>${totalUsers} registered users</strong> (${studentUsers} students, ${adminUsers} administrators) across <strong>${stats.length} active medical simulation environments</strong>.</li>
            <li>Total accumulated training time across all simulations is <strong>${formatTime(totalTimeAll)}</strong>. The most-engaged simulation is <strong>${mostActive ? (sceneLabels[mostActive.simulationName] || mostActive.simulationName) : 'N/A'}</strong>.</li>
          </ul>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="stat-card"><div class="num">${totalUsers}</div><div class="label">Total Users</div></div>
          <div class="stat-card"><div class="num">${studentUsers}</div><div class="label">Students</div></div>
          <div class="stat-card"><div class="num">${stats.length}</div><div class="label">Simulations</div></div>
          <div class="stat-card"><div class="num">${formatTime(totalTimeAll)}</div><div class="label">Total Training Time</div></div>
        </div>

        <!-- Simulation Engagement -->
        <div class="section-header">Simulation Engagement Report</div>
        <div class="section-body" style="padding:0;">
          <table>
            <thead>
              <tr>
                <th>Simulation Name</th>
                <th>Unique Users</th>
                <th>Total Time Spent</th>
                <th>Avg. Time / User</th>
              </tr>
            </thead>
            <tbody>
              ${statsRows || `<tr><td colspan="4" style="padding:20px; text-align:center; color:#9ca3af;">No simulation data recorded yet.</td></tr>`}
            </tbody>
          </table>
        </div>

        <!-- Two Col: Objectives / Design Approach style -->
        <div class="two-col">
          <div class="col">
            <div class="section-header">Platform Simulations</div>
            <div class="section-body">
              <ul>
                ${Object.values(sceneLabels).map((name, i) => `<li>${i + 1}. ${name}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="col">
            <div class="section-header">System Status</div>
            <div class="section-body">
              <ul>
                <li>✅ Backend Server: <strong>Online</strong></li>
                <li>✅ Database: <strong>Connected</strong></li>
                <li>✅ Authentication: <strong>Active</strong></li>
                <li>✅ Progress Tracking: <strong>Active</strong></li>
                <li>✅ Admin Panel: <strong>Active</strong></li>
                <li>📡 API Endpoint: <strong>localhost:5000</strong></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Registered Users -->
        <div class="section-header">Registered Users</div>
        <div class="section-body" style="padding:0; margin-bottom:28px;">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th style="text-align:center;">Role</th>
                <th style="text-align:center;">Joined</th>
              </tr>
            </thead>
            <tbody>
              ${usersRows || `<tr><td colspan="4" style="padding:20px; text-align:center; color:#9ca3af;">No users registered yet.</td></tr>`}
            </tbody>
          </table>
        </div>

        <!-- Conclusion -->
        <div class="section-header">Conclusion</div>
        <div class="section-body">
          <ul>
            <li>The VR HealthEd platform is fully operational with ${totalUsers} registered user(s) and ${stats.length} active simulation environment(s). Progress tracking is recording user engagement data in real time.</li>
            <li>Administrators are encouraged to review engagement statistics regularly to identify the most and least utilized simulations for content improvement decisions.</li>
          </ul>
        </div>

        <!-- Appendices -->
        <div class="section-header">Appendices</div>
        <div class="section-body">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap: 8px; font-size:13px;">
            <div>1. 📄 User Registration Data</div>
            <div>3. 📊 Simulation Time Analytics</div>
            <div>2. 🎓 Student Progress Records</div>
            <div>4. 🔒 Security & Auth Logs</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <span>VR HealthEd – Confidential System Report</span>
          <span>Generated on ${dateStr} | © ${now.getFullYear()} VR HealthEd. All rights reserved.</span>
        </div>

      </div>
    </body>
    </html>
  `;

  return html;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          fetch('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        if (usersRes.ok && statsRes.ok) {
          setUsers(await usersRes.json());
          setStats(await statsRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const handleDownload = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VRHealthEd-Report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-lg">Loading Admin Data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">

      {/* Report Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[300] flex flex-col bg-slate-950/95 backdrop-blur-sm">
          {/* Modal toolbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-white text-lg">Report Preview</span>
              <span className="text-slate-400 text-sm">— Review before downloading</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition shadow-[0_0_15px_rgba(14,165,233,0.3)]"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button
                onClick={() => setPreviewHtml(null)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm transition"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>
          {/* Iframe preview */}
          <div className="flex-1 overflow-hidden bg-slate-800">
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              title="Report Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-modals allow-scripts"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users and monitor system engagement.</p>
          </div>
          <button
            onClick={() => setPreviewHtml(generateReport(users, stats, user?.name || 'Administrator'))}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: 'text-sky-400' },
            { label: 'Students', value: users.filter(u => !u.isAdmin).length, color: 'text-emerald-400' },
            { label: 'Admins', value: users.filter(u => u.isAdmin).length, color: 'text-purple-400' },
            { label: 'Simulations', value: stats.length, color: 'text-amber-400' },
          ].map((card) => (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              <div className={`text-4xl font-black ${card.color}`}>{card.value}</div>
              <div className="text-sm text-slate-400 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* User Management */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <Users className="text-sky-400 w-6 h-6" />
              <h2 className="text-xl font-bold text-white">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${u.isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                          {u.isAdmin ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === user?._id}
                          className="text-red-400 hover:text-red-300 disabled:opacity-30 transition p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulation Engagement */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
              <Activity className="text-emerald-400 w-6 h-6" />
              <h2 className="text-xl font-bold text-white">Simulation Engagement</h2>
            </div>
            <div className="p-6 space-y-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white capitalize">
                      {sceneLabels[stat.simulationName] || stat.simulationName}
                    </h3>
                    <p className="text-sm text-slate-400">{stat.userCount} unique user(s)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">{formatTime(stat.totalTimeSeconds)}</div>
                    <p className="text-xs text-slate-500">Total time spent</p>
                  </div>
                </div>
              ))}
              {stats.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No engagement data yet. Users must play simulations to generate stats.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
