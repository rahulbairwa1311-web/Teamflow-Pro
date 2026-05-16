import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Trash2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: ''
  });

  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      if (user?.role === 'ADMIN') {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      }
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task created successfully');
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserId });
      toast.success('Member added');
      setIsMemberModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to add member or already added');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading || !project) return <div className="animate-pulse space-y-8">
    <div className="h-40 bg-white rounded-3xl mb-8"></div>
    <div className="grid grid-cols-3 gap-8">
      <div className="h-96 bg-white rounded-3xl col-span-2"></div>
      <div className="h-96 bg-white rounded-3xl"></div>
    </div>
  </div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">Active Project</span>
              <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">Added {format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{project.title}</h1>
            <p className="text-slate-500 mt-3 max-w-2xl font-medium leading-relaxed">{project.description}</p>
          </div>
          {user?.role === 'ADMIN' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all font-bold"
              >
                <UserPlus size={20} />
                <span className="hidden sm:inline">Add Member</span>
              </button>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100 transition-all font-bold"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Project Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-tight">
                {project.tasks.length} Total
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {project.tasks.map((task: any) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={task.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                    task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {task.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : 
                     task.status === 'IN_PROGRESS' ? <Clock size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar size={12} />
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No date'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                        task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Assignee</span>
                    <span className="text-sm font-bold text-slate-700">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>

                  <select 
                    value={task.status}
                    onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                    disabled={user.role !== 'ADMIN' && task.assignedToId !== user.id}
                    className="text-xs font-bold bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </motion.div>
            ))}

            {project.tasks.length === 0 && (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
                <CheckCircle2 size={32} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium font-medium">No tasks added to this project yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Members Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            {project.members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold font-sm">
                    {member.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{member.user.name}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
                {user.role === 'ADMIN' && member.user.id !== project.creatorId && (
                  <button 
                    onClick={() => handleRemoveMember(member.user.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Project Stats Summary */}
          <div className="bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 p-8 text-white">
            <h3 className="font-extrabold text-lg flex items-center gap-2 mb-6">
              <AlertCircle size={20} />
              Quick Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-black mt-1">{project.tasks.filter((t: any) => t.status === 'COMPLETED').length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-black mt-1">{project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="e.g. Develop login route"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="Provide details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Priority</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 block mb-2">Assign To Member</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none"
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                    required
                  >
                    <option value="">Select a member</option>
                    {project.members.map((m: any) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Addition Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Invite Member</h3>
              <form onSubmit={handleAddMember} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Select Team Member</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select User...</option>
                    {users.filter(u => !project.members.some((m: any) => m.user.id === u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedUserId}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
