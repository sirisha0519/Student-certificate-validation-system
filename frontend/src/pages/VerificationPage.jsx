import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  FileUp, 
  File, 
  Loader2, 
  User, 
  Award, 
  Calendar,
  X,
  History,
  Building
} from 'lucide-react';

const VerificationPage = () => {
  const { certificateId: routeId } = useParams();
  
  // Input states
  const [certIdInput, setCertIdInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // If a Certificate ID is provided directly in the URL route, verify it immediately
  useEffect(() => {
    if (routeId && routeId !== 'scan') {
      verifyById(routeId);
    }
  }, [routeId]);

  const verifyById = async (id) => {
    if (!id) return;
    setLoading(true);
    setResult(null);
    setSearched(true);
    try {
      const response = await API.get(`/verify/${id.trim()}`);
      setResult(response.data.data);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Could not connect to verification server');
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!certIdInput.trim()) {
      return toast.error('Please enter a Certificate ID');
    }
    verifyById(certIdInput.trim());
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

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!certIdInput.trim()) {
      return toast.error('Please enter the Certificate ID printed on the document first');
    }
    if (!pdfFile) {
      return toast.error('Please select or drop a PDF file');
    }

    setLoading(true);
    setResult(null);
    setSearched(true);

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const response = await API.post(`/verify/${certIdInput.trim()}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data.data);
    } catch (error) {
      console.error('File verification error:', error);
      toast.error('Failed to run verification on file');
    } finally {
      setLoading(false);
    }
  };

  const resetVerifier = () => {
    setResult(null);
    setSearched(false);
    setPdfFile(null);
    setCertIdInput('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-600/10 blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-2xl z-10 flex flex-col space-y-8">
        {/* Logo and Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              CertValidate
            </span>
          </div>
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Sign In to Dashboard →
          </Link>
        </div>

        {loading ? (
          <div className="glass-panel-dark rounded-2xl p-12 text-center border border-slate-800">
            <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto" />
            <p className="mt-4 text-slate-400 font-medium">Running cryptographic verification...</p>
            <p className="text-xs text-slate-500 mt-1">Comparing ledger records and verifying PDF file hash values.</p>
          </div>
        ) : searched && result ? (
          /* VERIFICATION RESULT CARD */
          <div className="glass-panel-dark rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
            {/* Status Header */}
            <div className={`p-6 border-b border-slate-800 flex items-center gap-3.5 ${
              result.status === 'Valid' 
                ? 'bg-emerald-950/20 text-emerald-400' 
                : result.status === 'Revoked' 
                ? 'bg-amber-950/20 text-amber-400' 
                : 'bg-red-950/20 text-red-400'
            }`}>
              {result.isValid ? (
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-red-400 shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-lg">{result.message.split(': ')[0]}</h3>
                <p className="text-xs text-slate-450 mt-0.5">{result.message.split(': ')[1] || 'Verification completed successfully'}</p>
              </div>
            </div>

            {/* Certificate Details */}
            {result.certificate && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Student Name</span>
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <User className="h-4.5 w-4.5 text-slate-400" />
                      {result.certificate.studentId?.studentName}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Roll Number</span>
                    <div className="font-bold text-slate-200 font-mono">
                      {result.certificate.studentId?.rollNumber}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Issued Course / Degree</span>
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <Award className="h-4.5 w-4.5 text-slate-400" />
                      {result.certificate.course}
                    </div>
                    <div className="text-xs text-slate-500 ml-6 mt-0.5">
                      {result.certificate.studentId?.branch} | {result.certificate.studentId?.department}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Issue Date</span>
                    <div className="flex items-center gap-2 font-medium text-slate-300">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(result.certificate.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      result.certificate.status === 'Active' 
                        ? 'bg-emerald-950/50 text-emerald-450 border border-emerald-900/50' 
                        : 'bg-red-950/50 text-red-450 border border-red-900/50'
                    }`}>
                      {result.certificate.status}
                    </span>
                  </div>
                </div>

                {/* Hash audit check */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SHA-256 Checksum Signature</span>
                  <span className="text-[11px] font-mono text-slate-400 break-all">{result.certificate.hashValue}</span>
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-850 flex items-center justify-between">
              <button 
                onClick={resetVerifier}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              >
                ← Verify Another Document
              </button>
              {result.certificate && (
                <a
                  href={result.certificate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all"
                >
                  View PDF Certificate
                </a>
              )}
            </div>
          </div>
        ) : (
          /* VERIFIER SEARCH FORMS */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">Public Verification Portal</h2>
              <p className="text-slate-400 text-sm mt-1">Authenticate student certificates and verify file hashes against the database ledger.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Search ID */}
              <div className="glass-panel-dark p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                    <Search className="h-5 w-5 text-primary-400" />
                    Verify via Certificate ID
                  </h3>
                  <p className="text-xs text-slate-450 mb-6 font-medium">Verify credentials instantly by typing in the Certificate ID string (e.g. CERT-4F8A92C1).</p>
                </div>
                
                <form onSubmit={handleIdSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter Certificate ID..."
                    value={certIdInput}
                    onChange={(e) => setCertIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-white placeholder-slate-500 font-semibold tracking-wide"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-primary-600/10 transition-colors"
                  >
                    Query Database
                  </button>
                </form>
              </div>

              {/* Option B: Cryptographic validation via PDF Upload */}
              <div className="glass-panel-dark p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
                    <FileUp className="h-5 w-5 text-emerald-400" />
                    Cryptographic integrity check
                  </h3>
                  <p className="text-xs text-slate-450 mb-4 font-medium">Provide the Certificate ID and upload the PDF file to regenerate the hash and check for document tampering.</p>
                </div>

                <form onSubmit={handleFileSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter Certificate ID first..."
                    value={certIdInput}
                    onChange={(e) => setCertIdInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs text-white placeholder-slate-500 font-semibold"
                  />
                  
                  {pdfFile ? (
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <File className="h-4.5 w-4.5 text-red-500 shrink-0" />
                        <span className="text-slate-300 font-medium truncate">{pdfFile.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setPdfFile(null)}
                        className="text-slate-500 hover:text-white p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-950/20' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                      }`}
                    >
                      <input
                        type="file"
                        id="verify-pdf"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="verify-pdf" className="cursor-pointer flex flex-col items-center">
                        <FileUp className="h-5 w-5 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-400 font-semibold">Drop PDF or browse</span>
                      </label>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={!pdfFile || !certIdInput}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Compare File Hash
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
