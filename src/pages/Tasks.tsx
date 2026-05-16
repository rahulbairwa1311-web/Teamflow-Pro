import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  Calendar,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';

export const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      toast.success('Task status updated');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesOverdue = statusFilter === 'OVERDUE' ? (task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' && !isToday(new Date(task.dueDate))) : true;
    
    return matchesSearch && matchesStatus && matchesOverdue;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Tasks</h2>
          <p className="text-slate-500 font-medium mt-1">Focus on what's next and hit your deadlines</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by task name or project..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-tight ${
                statusFilter === status 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table/List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="bento-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Task Info</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Project</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  {user?.role === 'ADMIN' && <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTasks.map((task) => {
                  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' && !isToday(new Date(task.dueDate));
                  
                  return (
                    <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-rose-50/20' : ''}`}>
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description || 'No description'}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 uppercase tracking-tight">
                          {task.project.title}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold flex items-center gap-1.5 ${isOverdue ? 'text-rose-500' : 'text-slate-600'}`}>
                            {isOverdue && <AlertCircle size={14} />}
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No deadline'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <select 
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className={`text-xs font-black px-3 py-2 rounded-xl border appearance-none text-center focus:outline-none transition-all cursor-pointer ${
                            task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="py-5 px-6 text-center">
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTasks.length === 0 && (
            <div className="py-20 text-center">
              <CheckCircle2 size={40} className="mx-auto text-slate-100 mb-6" />
              <h3 className="text-xl font-bold text-slate-900">All clear here!</h3>
              <p className="text-slate-400 font-medium">No tasks match your current filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
