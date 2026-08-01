import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  Search, 
  ExternalLink, 
  Trash2, 
  AlertOctagon, 
  Loader2, 
  Download, 
  Calendar,
  Filter
} from 'lucide-react';

const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Custom confirmation modals states
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [certToRevoke, setCertToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      // Backend automatically handles role scoping: Student gets their own, Admin gets all
      const response = await API.get('/certificates');
      setCertificates(response.data.data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const triggerRevoke = (cert) => {
    setCertToRevoke(cert);
    setRevokeConfirmOpen(true);
  };

  const handleRevokeSubmit = async () => {
    if (!certToRevoke) return;
    setRevoking(true);
    try {
      await API.patch(`/certificates/revoke/${certToRevoke._id}`);
      setCertificates(prev => prev.map(c => c._id === certToRevoke._id ? { ...c, status: 'Revoked' } : c));
      toast.success(`Certificate ${certToRevoke.certificateId} has been officially revoked.`);
      setRevokeConfirmOpen(false);
      setCertToRevoke(null);
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      toast.error(error.response?.data?.error || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const triggerDelete = (cert) => {
    setCertToDelete(cert);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!certToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/certificates/${certToDelete._id}`);
      setCertificates(prev => prev.filter(c => c._id !== certToDelete._id));
      toast.success('Certificate deleted successfully.');
      setDeleteConfirmOpen(false);
      setCertToDelete(null);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to delete certificate:', error);
      toast.error('Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  // Filter local certificates list
  const filteredCertificates = certificates.filter(cert => {
    const student = cert.studentId;
    const matchSearch = 
      cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student?.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student?.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchStatus = statusFilter === '' ? true : cert.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Base path for details depending on user role
  const detailsBasePath = user?.role === 'Admin' ? '/admin/certificates' : '/student/certificates';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificates Registry</h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Admin' 
              ? 'Oversee, search, and audit all student certificate credentials.' 
              : 'Browse your issued credentials and download verified PDF files.'}
          </p>
        </div>
        {user?.role === 'Admin' && (
          <Link
            to="/admin/upload"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 transition-all text-sm self-start sm:self-auto"
          >
            Upload Certificate
          </Link>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search ID, student, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all shadow-sm"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4.5 w-4.5 text-slate-400" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm cursor-pointer appearance-none shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Revoked">Revoked</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
        
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Found {filteredCertificates.length} Records
        </span>
      </div>

      {/* Certificates Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto" />
              <p className="mt-4 text-slate-500 text-sm">Retrieving certificates ledger...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Award className="h-12 w-12 mx-auto text-slate-300 stroke-1 mb-3" />
              <h4 className="font-semibold text-slate-700">No Certificates Found</h4>
              <p className="text-sm text-slate-400 mt-1">No certificate records match your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Certificate ID</th>
                  {user?.role === 'Admin' && <th className="px-6 py-4">Student Name</th>}
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredCertificates
                  .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                  .map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary-700">
                        {cert.certificateId}
                      </td>
                      {user?.role === 'Admin' && (
                        <td className="px-6 py-4 font-medium text-slate-800">
                          <div>{cert.studentId?.studentName}</div>
                          <div className="text-xs text-slate-450 font-semibold font-mono">Roll: {cert.studentId?.rollNumber}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-700 font-medium">{cert.course}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="h-4 w-4" />
                          {new Date(cert.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
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
                        {/* View Detail */}
                        <Link
                          to={`${detailsBasePath}/${cert._id}`}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                          title="View Certificate Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* PDF View */}
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent"
                          title="Open PDF"
                        >
                          <Download className="h-4 w-4" />
                        </a>

                        {/* Admin controls */}
                        {user?.role === 'Admin' && (
                          <>
                            {cert.status === 'Active' && (
                              <button
                                onClick={() => triggerRevoke(cert)}
                                className="inline-flex items-center justify-center p-2 text-slate-550 hover:text-amber-650 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                title="Revoke Certificate"
                              >
                                <AlertOctagon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => triggerDelete(cert)}
                              className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Delete Certificate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredCertificates.length > recordsPerPage && (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCertificates.length / recordsPerPage)))}
              disabled={currentPage === Math.ceil(filteredCertificates.length / recordsPerPage)}
              className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-555">
                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                <span className="font-bold text-slate-700">
                  {Math.min(currentPage * recordsPerPage, filteredCertificates.length)}
                </span>{' '}
                of <span className="font-bold text-slate-700">{filteredCertificates.length}</span> certificates
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
                {Array.from({ length: Math.ceil(filteredCertificates.length / recordsPerPage) }).map((_, i) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCertificates.length / recordsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredCertificates.length / recordsPerPage)}
                  className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Custom Revoke Confirmation Modal */}
      {revokeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRevokeConfirmOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-md w-full relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50 text-amber-700">
              <h3 className="font-bold flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                Revoke Certificate
              </h3>
              <button onClick={() => setRevokeConfirmOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Are you sure you want to revoke certificate <span className="font-bold text-slate-800">"{certToRevoke?.certificateId}"</span> for course <span className="font-bold text-slate-800">"{certToRevoke?.course}"</span>?
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 font-medium">
                Warning: Once revoked, the public verification status will display a warning. This action is irreversible.
              </p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setRevokeConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevokeSubmit}
                  disabled={revoking}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-650 hover:bg-amber-600 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {revoking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    'Revoke Certificate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-md w-full relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-red-50 text-red-700">
              <h3 className="font-bold flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Certificate Registry
              </h3>
              <button onClick={() => setDeleteConfirmOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Are you sure you want to delete certificate <span className="font-bold text-slate-800">"{certToDelete?.certificateId}"</span>? This will remove the verification entry entirely from the registry.
              </p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-650 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Entry'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesList;
