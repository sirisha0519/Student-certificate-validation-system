import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { 
  FileUp, 
  Search, 
  Calendar, 
  Award, 
  Loader2, 
  File, 
  X,
  ShieldCheck
} from 'lucide-react';

const UploadCertificate = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  
  // Selection
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [course, setCourse] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [pdfFile, setPdfFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        const response = await API.get('/students');
        setStudents(response.data.data);
      } catch (error) {
        console.error('Failed to load students list:', error);
        toast.error('Failed to load students list');
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on search string
  const filteredStudents = searchStudentQuery.trim() === ''
    ? []
    : students.filter(s => 
        s.studentName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchStudentQuery.toLowerCase())
      ).slice(0, 5); // show max 5 suggestions

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        return toast.error('Only PDF files are supported');
      }
      setPdfFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        return toast.error('Only PDF files are supported');
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      return toast.error('Please select a student');
    }
    if (!course) {
      return toast.error('Please enter the course name');
    }
    if (!issueDate) {
      return toast.error('Please enter the issue date');
    }
    if (!pdfFile) {
      return toast.error('Please upload a PDF certificate file');
    }

    setIsSubmitting(true);
    
    // Build multipart/form-data payload
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('studentId', selectedStudent._id);
    formData.append('course', course);
    formData.append('issueDate', issueDate);

    try {
      await API.post('/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Certificate generated and uploaded successfully!');
      navigate('/admin/certificates');
    } catch (error) {
      console.error('Failed to upload certificate:', error);
      const msg = error.response?.data?.error || 'Failed to upload certificate';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Certificate</h1>
        <p className="text-slate-500 mt-1">Generate verification hashes, QR codes, and securely upload PDF credentials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Picker Search */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assign Student</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-4 bg-primary-50/50 border border-primary-100 rounded-xl">
                <div>
                  <div className="font-bold text-slate-800">{selectedStudent.studentName}</div>
                  <div className="text-xs text-slate-500 font-mono">Roll No: {selectedStudent.rollNumber} | {selectedStudent.branch}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-450 hover:text-slate-700 bg-white p-1 rounded-full border shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {studentsLoading ? (
                      <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5 text-slate-400" />
                    )}
                  </span>
                  <input
                    type="text"
                    disabled={studentsLoading}
                    placeholder="Search student by name or roll number..."
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
                
                {/* Suggestions dropdown */}
                {filteredStudents.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white mt-1.5 border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 overflow-hidden">
                    {filteredStudents.map((student) => (
                      <li key={student._id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchStudentQuery('');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-55 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">{student.studentName}</span>
                            <span className="text-xs text-slate-400 font-mono">Roll: {student.rollNumber}</span>
                          </div>
                          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                            {student.branch}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                
                {searchStudentQuery.trim() !== '' && filteredStudents.length === 0 && (
                  <div className="absolute z-10 w-full bg-white mt-1.5 border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm text-slate-400 text-center">
                    No students match your query
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Course Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Award className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Technology in CS"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Issue Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* PDF File Picker (Drag and drop) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Certificate PDF File</label>
            {pdfFile ? (
              <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-50 border border-red-100 text-red-650 rounded-lg flex items-center justify-center shrink-0">
                    <File className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm max-w-md truncate">{pdfFile.name}</div>
                    <div className="text-xs text-slate-550 font-medium font-mono">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full border shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50/20' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                    <FileUp className="h-7 w-7 text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">Drag and drop file here</span>
                  <span className="text-xs text-slate-450 mt-1 block">or click to browse from files (Only PDF supported)</span>
                </label>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || !(selectedStudent && course && issueDate && pdfFile)}
              className="w-full flex items-center justify-center py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 transition-all gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating & Uploading...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Generate & Upload Certificate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCertificate;
