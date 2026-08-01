import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Award, 
  History, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalCertificates: 0,
    revokedCertificates: 0,
    verifiedToday: 0
  });
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Execute concurrent API calls
        const [studentsRes, certsRes, logsRes] = await Promise.all([
          API.get('/students'),
          API.get('/certificates'),
          API.get('/logs')
        ]);

        const students = studentsRes.data.data;
        const certs = certsRes.data.data;
        const logs = logsRes.data.data;

        // Calculate metrics
        const revoked = certs.filter(c => c.status === 'Revoked').length;
        
        // Count verified today (logs within the last 24h)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const verifiedTodayCount = logs.filter(log => {
          const logDate = new Date(log.verifiedAt);
          return logDate >= today;
        }).length;

        setMetrics({
          totalStudents: students.length,
          totalCertificates: certs.length,
          revokedCertificates: revoked,
          verifiedToday: verifiedTodayCount
        });

        // Set recent items (max 5)
        setRecentCertificates(certs.slice(0, 5));
        setRecentLogs(logs.slice(0, 5));

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Assembling dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Enrolled Students',
      value: metrics.totalStudents,
      icon: Users,
      color: 'bg-blue-500 text-blue-500',
      bg: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Certificates Uploaded',
      value: metrics.totalCertificates,
      icon: Award,
      color: 'bg-emerald-500 text-emerald-500',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Verifications Today',
      value: metrics.verifiedToday,
      icon: History,
      color: 'bg-violet-500 text-violet-500',
      bg: 'bg-violet-50 border-violet-100'
    },
    {
      title: 'Revoked Certificates',
      value: metrics.revokedCertificates,
      icon: AlertTriangle,
      color: 'bg-amber-500 text-amber-500',
      bg: 'bg-amber-50 border-amber-100'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Real-time indicators and recent certificate status updates.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`p-6 rounded-2xl border bg-white flex items-center justify-between shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-300`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</span>
                <p className="text-3xl font-extrabold text-slate-900">{card.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${card.bg} border shrink-0`}>
                <Icon className={`h-6 w-6 ${card.color.split(' ')[1]}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary-500" />
              Recent Uploads
            </h3>
            <Link to="/admin/certificates" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto mt-4">
            {recentCertificates.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No certificates uploaded yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3">Certificate ID</th>
                    <th className="py-3">Student</th>
                    <th className="py-3">Course</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {recentCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-semibold text-primary-600">
                        <Link to={`/admin/certificates`}>{cert.certificateId}</Link>
                      </td>
                      <td className="py-3.5 text-slate-700">{cert.studentId?.studentName}</td>
                      <td className="py-3.5 text-slate-600">{cert.course}</td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          cert.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : cert.status === 'Revoked' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Verification Logs Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-violet-500" />
              Recent Verification Audits
            </h3>
            <Link to="/admin/logs" className="text-xs font-semibold text-violet-650 hover:text-violet-700 flex items-center gap-1 group">
              View Logs <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto mt-4">
            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No verification logs recorded.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3">Cert ID</th>
                    <th className="py-3">Logged IP</th>
                    <th className="py-3">Date/Time</th>
                    <th className="py-3 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {recentLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-medium text-slate-700">{log.certificateId}</td>
                      <td className="py-3.5 text-slate-500 font-mono text-xs">{log.ipAddress}</td>
                      <td className="py-3.5 text-slate-500">
                        {new Date(log.verifiedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          log.status.includes('Valid') 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : log.status.includes('Revoked') 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
