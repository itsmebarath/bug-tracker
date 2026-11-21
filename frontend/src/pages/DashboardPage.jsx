import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  ArrowUpRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import IssueModal from '../components/IssueModal';

export default function DashboardPage() {
  const { refreshKey } = useOutletContext() || {};
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: summary?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Total Issues',
      value: summary?.totalIssues || 0,
      icon: ListTodo,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'In Progress',
      value: summary?.inProgressIssues || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Completed',
      value: summary?.completedIssues || 0,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Assigned to Me',
      value: summary?.myAssignedIssues || 0,
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  const total = summary?.totalIssues || 0;
  const todoPct = total ? Math.round(((summary?.openIssues || 0) / total) * 100) : 0;
  const progPct = total ? Math.round(((summary?.inProgressIssues || 0) / total) * 100) : 0;
  const revPct = total ? Math.round(((summary?.inReviewIssues || 0) / total) * 100) : 0;
  const donePct = total ? Math.round(((summary?.completedIssues || 0) / total) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-indigo-700 to-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-indigo-900/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hello, {user?.fullName || 'Developer'} 👋
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            Here is your current issue tracking overview and team activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/kanban"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5"
          >
            <span>Open Kanban</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/projects"
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            Manage Projects
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>Workflow Completion Status</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">{total} Total Tickets</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
          <div style={{ width: `${todoPct}%` }} className="bg-slate-400" title={`To Do: ${todoPct}%`} />
          <div style={{ width: `${progPct}%` }} className="bg-amber-500" title={`In Progress: ${progPct}%`} />
          <div style={{ width: `${revPct}%` }} className="bg-blue-500" title={`In Review: ${revPct}%`} />
          <div style={{ width: `${donePct}%` }} className="bg-emerald-500" title={`Done: ${donePct}%`} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
            <span>To Do: <strong>{summary?.openIssues || 0}</strong> ({todoPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
            <span>In Progress: <strong>{summary?.inProgressIssues || 0}</strong> ({progPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
            <span>In Review: <strong>{summary?.inReviewIssues || 0}</strong> ({revPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
            <span>Done: <strong>{summary?.completedIssues || 0}</strong> ({donePct}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Issues & Bugs</h2>
          <Link to="/issues" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View All Issues →
          </Link>
        </div>

        {summary?.recentIssues?.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No issues created yet. Click "Create Issue" to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Key</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary?.recentIssues?.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-indigo-600 text-xs whitespace-nowrap">
                      {issue.key}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {issue.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {issue.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        issue.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        issue.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                        issue.priority === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        issue.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        issue.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        issue.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs whitespace-nowrap">
                      {issue.assignee ? issue.assignee.fullName : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          isOpen={!!selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={() => fetchSummary()}
        />
      )}
    </div>
  );
}

