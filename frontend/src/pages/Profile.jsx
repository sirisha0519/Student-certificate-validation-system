import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Building, Award, Loader2, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(user?.role === 'Student');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (user?.role !== 'Student') return;
      try {
        setLoading(true);
        // Scoped to the student in backend, so we fetch their certificates which contains their populated student profile!
        const response = await API.get('/certificates');
        if (response.data.data.length > 0) {
          setStudentDetails(response.data.data[0].studentId);
        } else {
          // If no certificates exist, look up student record in students endpoint (scoped) or fallback
          const studentRes = await API.get('/students');
          // If student has a profile entered by admin, we extract it
          const matchingProfile = studentRes.data.data.find(s => s.userId?.email === user.email);
          if (matchingProfile) {
            setStudentDetails(matchingProfile);
          }
        }
      } catch (error) {
        console.error('Failed to load profile details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information and authentication credentials.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-indigo-650 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-primary-700 font-extrabold text-2xl select-none">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* User Metadata */}
        <div className="pt-14 pb-8 px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
              <p className="text-sm text-slate-450 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary-50 border border-primary-100 text-primary-700 uppercase tracking-wider self-start sm:self-auto">
              {user?.role} Account
            </span>
          </div>

          {/* Detailed information */}
          {user?.role === 'Student' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Building className="h-4.5 w-4.5 text-slate-450" />
                Academic Enrollment Information
              </h3>
              
              {studentDetails ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</span>
                    <p className="font-bold text-slate-800 mt-0.5 font-mono">
                      {studentDetails.rollNumber.startsWith('TEMP-') ? (
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs">Awaiting registry details</span>
                      ) : (
                        studentDetails.rollNumber
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Year</span>
                    <p className="font-bold text-slate-800 mt-0.5">{studentDetails.year}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch Major</span>
                    <p className="font-bold text-slate-800 mt-0.5">{studentDetails.branch}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Department</span>
                    <p className="font-bold text-slate-800 mt-0.5">{studentDetails.department}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-700">
                  ⚠️ No academic details have been configured for your profile yet. Please wait for an administrator to set up your roll number.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
