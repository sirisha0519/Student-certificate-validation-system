import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  User, 
  Calendar, 
  QrCode, 
  FileText, 
  Copy, 
  Check, 
  ArrowLeft, 
  Download, 
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

const CertificateDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchCertificateDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/certificates/${id}`);
        setCertificate(response.data.data);
      } catch (error) {
        console.error('Failed to load certificate details:', error);
        toast.error('Certificate not found or access denied');
        // Redirect to dashboard
        const dashboard = user?.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard';
        navigate(dashboard);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificateDetails();
  }, [id, navigate, user]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      toast.success('SHA-256 hash copied to clipboard');
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedLink(true);
      toast.success('Verification URL copied');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
          <p className="mt-4 text-slate-550 font-medium">Decrypting certificate records...</p>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateId}`;
  const backPath = user?.role === 'Admin' ? '/admin/certificates' : '/student/certificates';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          to={backPath}
          className="inline-flex items-center justify-center h-10 w-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificate Details</h1>
          <p className="text-slate-500 mt-1">Audit security hashes and QR codes for this credential.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Certificate details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificate ID</span>
              <h2 className="text-2xl font-bold text-primary-700 tracking-tight">{certificate.certificateId}</h2>
            </div>
            <span className={`inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
              certificate.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : certificate.status === 'Revoked' 
                ? 'bg-red-50 text-red-700 border border-red-100' 
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {certificate.status} Certificate
            </span>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-55 border h-fit text-slate-500 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</span>
                <p className="font-bold text-slate-800 text-md">{certificate.studentId?.studentName}</p>
                <p className="text-xs text-slate-500 font-mono">Roll: {certificate.studentId?.rollNumber}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-55 border h-fit text-slate-500 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course / Major</span>
                <p className="font-bold text-slate-800 text-md">{certificate.course}</p>
                <p className="text-xs text-slate-500">{certificate.studentId?.branch} | {certificate.studentId?.department}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-55 border h-fit text-slate-500 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Date</span>
                <p className="font-bold text-slate-800 text-md">
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-slate-55 border h-fit text-slate-500 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued By</span>
                <p className="font-bold text-slate-850 text-md">{certificate.uploadedBy?.name}</p>
                <p className="text-xs text-slate-500">{certificate.uploadedBy?.email}</p>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-4 w-4 text-slate-400" />
                SHA-256 Hash Value
              </span>
              <button 
                onClick={() => copyToClipboard(certificate.hashValue, 'hash')}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy Hash"
              >
                {copiedHash ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 font-mono break-all font-medium">{certificate.hashValue}</p>
            <p className="text-[10px] text-slate-450 font-medium">This hash represents the cryptographic verification signature of the original PDF document.</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={certificate.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all text-sm"
            >
              <Download className="h-4.5 w-4.5" />
              Download Certificate PDF
            </a>
          </div>
        </div>

        {/* QR Code and verification links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-between text-center space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 justify-center">
              <QrCode className="h-5 w-5 text-slate-500" />
              Verification QR Code
            </h3>
            <p className="text-xs text-slate-450 font-medium px-4">Scan this QR Code using any device to verify this certificate status instantly.</p>
          </div>

          <div className="border border-slate-100 p-4 bg-slate-50/50 rounded-2xl shadow-inner">
            <img 
              src={certificate.qrCodeUrl} 
              alt={`QR Code for ${certificate.certificateId}`}
              className="w-48 h-48 object-contain rounded-lg"
            />
          </div>

          <div className="w-full space-y-3">
            <div className="relative w-full">
              <input
                type="text"
                readOnly
                value={verificationUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 font-mono text-center select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(verificationUrl, 'link')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-700"
                title="Copy Link"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            
            <a
              href={certificate.qrCodeUrl}
              download={`${certificate.certificateId}-QR.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-semibold rounded-xl text-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              Download QR Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetails;
