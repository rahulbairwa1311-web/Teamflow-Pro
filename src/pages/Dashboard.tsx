import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  recentTasks: any[];
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <div className="grid grid-cols-12 auto-rows-[120px] gap-6 animate-pulse">
      <div className="col-span-8 row-span-2 bg-white rounded-[2rem]"></div>
      <div className="col-span-2 row-span-2 bg-white rounded-[2rem]"></div>
      <div className="col-span-2 row-span-2 bg-white rounded-[2rem]"></div>
      <div className="col-span-8 row-span-4 bg-white rounded-[2rem]"></div>
      <div className="col-span-4 row-span-4 bg-white rounded-[2rem]"></div>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6 pb-10">
      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full md:col-span-8 row-span-2 bento-card-indigo flex flex-col justify-between min-h-[300px]"
      >
        <div className="relative z-10">
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="text-indigo-100 max-w-md text-lg font-medium">
            You have <span className="text-white font-bold">{stats.todo + stats.inProgress} tasks</span> pending. 
            Overall completion is at <span className="text-white font-bold">{stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0}%</span>.
          </p>
        </div>
        <div className="flex gap-4 relative z-10 pt-8">
          <Link to="/projects" className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-50 transition-all">
            View Projects
          </Link>
          <Link to="/tasks" className="bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-bold text-sm border border-indigo-400/50 hover:bg-indigo-400 transition-all">
            My Task List
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-400 rounded-full opacity-20 blur-2xl"></div>
      </motion.div>

      {/* Stats Card: Active Projects */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-full md:col-span-2 row-span-2 bento-card flex flex-col items-center justify-center text-center shadow-indigo-100/20"
      >
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <FolderKanban size={28} />
        </div>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Projects</span>
        <span className="text-5xl font-black text-slate-800">{stats.totalProjects.toString().padStart(2, '0')}</span>
        <div className="mt-4 flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
          Active track
        </div>
      </motion.div>

      {/* Stats Card: Overdue */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-full md:col-span-2 row-span-2 bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center shadow-sm"
      >
        <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl mb-4">
          <AlertCircle size={28} />
        </div>
        <span className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-1">Overdue</span>
        <span className="text-5xl font-black text-rose-600">{stats.overdue.toString().padStart(2, '0')}</span>
        <div className="mt-4 px-4 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
          Urgent
        </div>
      </motion.div>

      {/* Ongoing Tasks Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-full md:col-span-8 row-span-4 bento-card flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Assignments</h3>
          <Link to="/tasks" className="text-indigo-600 text-sm font-bold hover:underline underline-offset-4">View All</Link>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Task details</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6">
                    <p className="font-bold text-slate-800 text-base">{task.title}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tight">{task.project.title}</p>
                  </td>
                  <td className="py-6">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                      task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500' :
                        task.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Clock className="text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">No tasks assigned yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Priority Distribution Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="col-span-full md:col-span-4 row-span-4 bento-card-dark"
      >
        <h3 className="text-xl font-bold mb-8">Task Distribution</h3>
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-3.5 h-3.5 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.6)]"></div>
                <span className="text-sm font-bold text-slate-300">High Priority</span>
              </div>
              <span className="font-mono text-xl font-black">{stats.priorityDistribution.high}</span>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-3.5 h-3.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)]"></div>
                <span className="text-sm font-bold text-slate-300">Medium Priority</span>
              </div>
              <span className="font-mono text-xl font-black">{stats.priorityDistribution.medium}</span>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-3.5 h-3.5 bg-indigo-400 rounded-full shadow-[0_0_12px_rgba(129,140,248,0.6)]"></div>
                <span className="text-sm font-bold text-slate-300">Low Priority</span>
              </div>
              <span className="font-mono text-xl font-black">{stats.priorityDistribution.low}</span>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-10">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-5">System Intelligence</p>
            <div className="bg-slate-800/40 p-5 rounded-[1.5rem] border border-slate-700/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">All systems operational</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Last synced: Just now</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
