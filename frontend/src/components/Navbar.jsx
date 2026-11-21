import React, { useState } from 'react';
import { Plus, LogOut, Bell, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateIssueModal from './CreateIssueModal';

export default function Navbar({ onIssueCreated }) {
  const { user, logout } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues, projects, tickets..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Issue</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700 hidden sm:inline">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {isCreateModalOpen && (
        <CreateIssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            if (onIssueCreated) onIssueCreated();
          }}
        />
      )}
    </>
  );
}

