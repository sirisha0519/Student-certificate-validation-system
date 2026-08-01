import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { Award, User, ExternalLink, Calendar, Loader2, Download } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // GET /api/certificates is auto-scoped to the logged-in student in the backend
        const response = await API.get('/certificates');
        setCertificates(response.data.data);
      } catch (error) {
        console.error('Failed to load student dashboard:', error);
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="mt-4 text-slate-500 font-medium">Loading your academic record...</p>
        </div>
      </div>
    );
  }

  const activeCerts = certificates.filter(c => c.status === 'Active');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here is a summary of your academic credentials and verified certificates.</p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">My Certificates</span>
            <p className="text-3xl font-extrabold text-slate-900">{certificates.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-primary-600 shrink-0">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Active</span>
            <p className="text-3xl font-extrabold text-emerald-600">{activeCerts.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Type</span>
            <p className="text-xl font-bold text-slate-700 capitalize">{user?.role} Portal</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-55 text-slate-600 border shrink-0">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Certificates Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-500" />
            My Credential Documents
          </h3>
        </div>

        <div className="overflow-x-auto">
          {certificates.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Award className="h-12 w-12 mx-auto text-slate-300 stroke-1 mb-3" />
              <h4 className="font-semibold text-slate-700">No Certificates Found</h4>
              <p className="text-sm text-slate-400 mt-1">Please contact your administrator if this is an error.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Course/Major</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary-700">
                      {cert.certificateId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-850">{cert.course}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        cert.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : cert.status === 'Revoked' 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {/* View details */}
                      <Link
                        to={`/student/certificates/${cert._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:text-white hover:bg-primary-600 border border-primary-200 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Details
                      </Link>

                      {/* Direct PDF Download Link */}
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
