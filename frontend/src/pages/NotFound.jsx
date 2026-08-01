import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="h-16 w-16 bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center border border-red-900/50 mx-auto animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
          <p className="text-slate-400 text-sm">The path you are trying to access doesn't exist or has been relocated.</p>
        </div>

        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary-600/10"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Application
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
