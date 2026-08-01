import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Loader2, 
  Check, 
  AlertCircle
} from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentStudentId, setCurrentStudentId] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    rollNumber: '',
    department: '',
    branch: '',
    year: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  // Custom delete confirmation modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  


  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/students');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load student profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      studentName: '',
      email: '',
      rollNumber: '',
      department: '',
      branch: '',
      year: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit');
    setCurrentStudentId(student._id);
    setFormData({
      studentName: student.studentName,
      email: student.userId?.email || '',
      rollNumber: student.rollNumber,
      department: student.department,
      branch: student.branch,
      year: student.year
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const response = await API.post('/students', formData);
        setStudents(prev => [...prev, response.data.data]);
        toast.success('Student added successfully!');
      } else {
        const response = await API.put(`/students/${currentStudentId}`, formData);
        setStudents(prev => prev.map(s => s._id === currentStudentId ? response.data.data : s));
        toast.success('Student updated successfully!');
      }
      setIsModalOpen(false);
      // Re-fetch to update user models relation if needed
      fetchStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
      const msg = error.response?.data?.error || error.response?.data?.errors?.[0]?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/students/${studentToDelete._id}`);
      setStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
      toast.success('Student and user account deleted successfully.');
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
      // Reset to page 1 if current page becomes empty after delete
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error('Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  // Filter students by search query
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.studentName.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query) ||
      (student.userId?.email || '').toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query) ||
      student.branch.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Students</h1>
          <p className="text-slate-500 mt-1">Enroll new student profiles and configure academic variables.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 transition-all text-sm self-start sm:self-auto gap-2"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Add Student
        </button>
      </div>

      {/* Search & Statistics */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search name, roll, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page to 1 on search filter change
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 self-end md:self-auto">
          Showing {filteredStudents.length} of {students.length} Students
        </span>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto" />
              <p className="mt-4 text-slate-500 text-sm">Retrieving student directories...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="h-12 w-12 mx-auto text-slate-300 stroke-1 mb-3" />
              <h4 className="font-semibold text-slate-700">No Students Found</h4>
              <p className="text-sm text-slate-400 mt-1">Try refining your search or add a new record.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-550 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Academic details</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredStudents
                  .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                  .map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student.studentName}</div>
                        <div className="text-xs text-slate-500 font-medium">{student.userId?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 font-mono text-sm">
                        {student.rollNumber.startsWith('TEMP-') ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Awaiting details (TBD)</span>
                        ) : (
                          student.rollNumber
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{student.branch}</div>
                        <div className="text-xs text-slate-500">{student.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                          {student.year}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(student)}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredStudents.length > recordsPerPage && (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / recordsPerPage)))}
              disabled={currentPage === Math.ceil(filteredStudents.length / recordsPerPage)}
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
                  {Math.min(currentPage * recordsPerPage, filteredStudents.length)}
                </span>{' '}
                of <span className="font-bold text-slate-700">{filteredStudents.length}</span> students
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
                {Array.from({ length: Math.ceil(filteredStudents.length / recordsPerPage) }).map((_, i) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / recordsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredStudents.length / recordsPerPage)}
                  className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-lg w-full relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900">
                {modalMode === 'create' ? 'Enroll New Student' : 'Update Student Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student Name</label>
                    <input
                      type="text"
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={modalMode === 'edit'} // Lock email on edit to keep user ID mapping simple
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:opacity-50 disabled:bg-slate-55"
                      placeholder="jane@university.edu"
                    />
                    {modalMode === 'create' && (
                      <p className="text-xs text-slate-450 mt-1 flex items-start gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-primary-500 shrink-0" />
                        We will automatically provision a student login using this email. Initial password will be their roll number.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      required
                      value={formData.rollNumber.startsWith('TEMP-') ? '' : formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="2026CS001"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Year</label>
                    <select
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department</label>
                    <input
                      type="text"
                      name="department"
                      required
                      value={formData.department === 'TBD' ? '' : formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      required
                      value={formData.branch === 'TBD' ? '' : formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Computer Science"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4.5 w-4.5" />
                      {modalMode === 'create' ? 'Add Student' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
          
          <div className="bg-white rounded-2xl max-w-md w-full relative z-10 shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-red-50 text-red-700">
              <h3 className="font-bold">Delete Student Profile</h3>
              <button onClick={() => setDeleteConfirmOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Are you sure you want to delete student <span className="font-bold text-slate-800">"{studentToDelete?.studentName}"</span> and their associated login account? This action is permanent and cannot be undone.
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
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Student'
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

export default ManageStudents;
