import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bug,
  FolderKanban
} from 'lucide-react';
import api from '../api/axios';
import IssueModal from '../components/IssueModal';
import CreateIssueModal from '../components/CreateIssueModal';

const COLUMNS = [
  { id: 'TO_DO', title: 'To Do', color: 'border-slate-300 text-slate-700 bg-slate-50' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-300 text-amber-800 bg-amber-50/50' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-blue-300 text-blue-800 bg-blue-50/50' },
  { id: 'DONE', title: 'Done', color: 'border-emerald-300 text-emerald-800 bg-emerald-50/50' },
];

export default function KanbanBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [draggedIssueId, setDraggedIssueId] = useState(null);

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
        if (!selectedProjectId && res.data.length > 0) {
          const firstId = res.data[0].id;
          setSelectedProjectId(firstId);
          setSearchParams({ projectId: firstId });
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };

    fetchProjects();
  }, []);

  // Fetch issues for selected project
  const fetchIssues = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/issues/project/${selectedProjectId}`);
      setIssues(res.data);
    } catch (err) {
      console.error('Failed to load project issues', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchIssues();
      setSearchParams({ projectId: selectedProjectId });
    }
  }, [selectedProjectId]);

  // Drag and Drop Handlers
  const handleDragStart = (e, issueId) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (!issueId) return;

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((item) => (item.id === issueId ? { ...item, status: targetStatus } : item))
    );

    try {
      await api.patch(`/issues/${issueId}/status`, { status: targetStatus });
    } catch (err) {
      console.error('Failed to update issue status', err);
      // Rollback on error
      fetchIssues();
    } finally {
      setDraggedIssueId(null);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (priorityFilter !== 'ALL' && issue.priority !== priorityFilter) return false;
    return true;
  });

  const priorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">MED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Bar: Project selector & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-6 w-6 text-indigo-600 shrink-0" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-lg font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden text-slate-800 font-bold"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ticket</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
          {COLUMNS.map((column) => {
            const columnIssues = filteredIssues.filter((i) => i.status === column.id);

            return (
              <div
                key={column.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                className="bg-slate-100/70 rounded-xl border border-slate-200 flex flex-col h-full max-h-full overflow-hidden"
              >
                {/* Column Header */}
                <div className={`px-4 py-3 border-b flex items-center justify-between font-bold text-xs uppercase tracking-wider ${column.color}`}>
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    <span className="bg-white/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] shadow-2xs font-mono">
                      {columnIssues.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards Drop Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {columnIssues.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400 italic">
                      Drag issues here
                    </div>
                  ) : (
                    columnIssues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue.id)}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-indigo-300 space-y-2.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {issue.key}
                          </span>
                          {priorityBadge(issue.priority)}
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {issue.title}
                        </h4>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-slate-400 uppercase text-[10px]">
                            {issue.type}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {issue.assignee ? (
                              <div
                                title={`Assigned to ${issue.assignee.fullName}`}
                                className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-200"
                              >
                                {issue.assignee.fullName.charAt(0)}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Unassigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={() => fetchIssues()}
        />
      )}

      {/* Create Issue Modal */}
      {isCreateOpen && (
        <CreateIssueModal
          isOpen={isCreateOpen}
          defaultProjectId={selectedProjectId}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchIssues();
          }}
        />
      )}
    </div>
  );
}

