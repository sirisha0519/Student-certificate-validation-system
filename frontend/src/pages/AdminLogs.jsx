import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { History, Calendar, Globe, AlertCircle, Loader2 } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/logs');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to load verification audits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verification Audits</h1>
        <p className="text-slate-500 mt-1">Audit log records representing public search queries and file authenticity verification checks.</p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-white">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History className="h-5 w-5 text-violet-500" />
            Verification History Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto" />
              <p className="mt-4 text-slate-550 text-sm">Opening audit ledger...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <History className="h-12 w-12 mx-auto text-slate-300 stroke-1 mb-3" />
              <h4 className="font-semibold text-slate-700">No Audits Found</h4>
              <p className="text-sm text-slate-400 mt-1">No certificate verifications have been logged yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Verifier IP Address</th>
                  <th className="px-6 py-4">Logged Time</th>
                  <th className="px-6 py-4 text-right">Audit Outcome</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {logs
                  .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                  .map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {log.certificateId}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-slate-400" />
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(log.verifiedAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          log.status.includes('Valid') 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : log.status.includes('Revoked') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          <AlertCircle className="h-3.5 w-3.5" />
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

      {/* Pagination Controls */}
      {logs.length > recordsPerPage && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(logs.length / recordsPerPage)))}
              disabled={currentPage === Math.ceil(logs.length / recordsPerPage)}
              className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                <span className="font-bold text-slate-700">
                  {Math.min(currentPage * recordsPerPage, logs.length)}
                </span>{' '}
                of <span className="font-bold text-slate-700">{logs.length}</span> audit logs
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.ceil(logs.length / recordsPerPage) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      currentPage === i + 1
                        ? 'z-10 bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'text-slate-600 border border-slate-200 bg-white hover:bg-slate-55'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(logs.length / recordsPerPage)))}
                  disabled={currentPage === Math.ceil(logs.length / recordsPerPage)}
                  className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
