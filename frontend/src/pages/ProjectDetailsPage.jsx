import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Users, 
  UserPlus, 
  Trash2, 
  ArrowLeft, 
  AlertCircle,
  KanbanSquare,
  ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to load project', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setAddingMember(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/projects/${id}/members`, { email: newMemberEmail.trim() });
      setProject(res.data);
      setSuccess('Team member added successfully!');
      setNewMemberEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;

    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data);
      setSuccess('Member removed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
        <Link to="/projects" className="text-sm text-indigo-600 font-semibold mt-2 inline-block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin = user?.role === 'ADMIN' || project?.owner?.id === user?.id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {project.key}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">{project.description || 'No description provided.'}</p>
          <div className="mt-3 text-xs text-slate-400">
            Created on {new Date(project.createdAt).toLocaleDateString()} • Project Lead: <strong>{project.owner?.fullName}</strong>
          </div>
        </div>

        <Link
          to={`/kanban?projectId=${project.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <KanbanSquare className="h-4 w-4" />
          <span>Open Kanban Board</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs">
          {success}
        </div>
      )}

      {/* Team Members Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span>Project Team Members ({project.members?.length || 0})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only members can be assigned tickets or manage issues in this project.
            </p>
          </div>

          {isOwnerOrAdmin && (
            <form onSubmit={handleAddMember} className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                placeholder="User email address..."
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
              <button
                type="submit"
                disabled={addingMember}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {project.members?.map((member) => (
            <div key={member.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {member.fullName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{member.fullName}</p>
                    {project.owner?.id === member.id && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                        Project Lead
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-500">{member.role}</span>
                {isOwnerOrAdmin && project.owner?.id !== member.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove member"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

