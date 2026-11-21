import React, { useState, useEffect } from 'react';
import { Users, Mail, Calendar, Shield, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setMembers(res.data);
      } catch (err) {
        console.error('Failed to load team members', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="h-3 w-3" />
            <span>Administrator</span>
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="h-3 w-3" />
            <span>Project Manager</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Developer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
        <p className="text-sm text-slate-500 mt-0.5">All developers and managers across your organization</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                  {member.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{member.fullName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="mt-2.5">{roleBadge(member.role)}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

