import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Clock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function IssueModal({ issueId, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (!issueId || !isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [issueRes, commentsRes, usersRes] = await Promise.all([
          api.get(`/issues/${issueId}`),
          api.get(`/issues/${issueId}/comments`),
          api.get('/users'),
        ]);

        setIssue(issueRes.data);
        setComments(commentsRes.data);
        setTeamMembers(usersRes.data);
      } catch (err) {
        console.error('Failed to load issue details', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [issueId, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      setIssue(res.data);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    try {
      const res = await api.patch(`/issues/${issueId}/assign`, { assigneeId: newAssigneeId || null });
      setIssue(res.data);
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error('Failed to reassign', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/issues/${issueId}/comments`, { content: newComment.trim() });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const priorityColors = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              {issue?.key || 'ISSUE'}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              {issue?.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 cols: Title, description, comments */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{issue?.title}</h1>
                <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {issue?.description || 'No description provided.'}
                </p>
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Activity & Comments ({comments.length})
                </h3>

                {/* Comment list */}
                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span className="font-semibold text-slate-800">
                            {comment.author?.fullName || 'User'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                            </span>
                            {(user?.role === 'ADMIN' || user?.email === comment.author?.email) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Delete comment"
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right sidebar: Details & Meta */}
            <div className="space-y-5 bg-slate-50/60 p-4 rounded-xl border border-slate-100 h-fit">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Status
                </label>
                <select
                  value={issue?.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Priority
                </label>
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${priorityColors[issue?.priority] || 'bg-slate-100 text-slate-700'}`}>
                  {issue?.priority}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Assignee
                </label>
                <select
                  value={issue?.assignee?.id || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-200/60 pt-3 text-xs text-slate-500 space-y-2">
                <div>
                  <span className="font-semibold text-slate-700">Project: </span>
                  {issue?.projectName} ({issue?.projectKey})
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Reporter: </span>
                  {issue?.reporter?.fullName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Created {issue?.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

