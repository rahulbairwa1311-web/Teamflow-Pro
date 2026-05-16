import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Users as UsersIcon, 
  Mail, 
  ShieldCheck, 
  Calendar,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        toast.error('Unauthorized access');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) return <div className="space-y-6">
    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Team Directory</h2>
        <p className="text-slate-500 font-medium mt-1">Manage team members and their roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={user.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                user.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {user.name}
                  {user.role === 'ADMIN' && <ShieldAlert size={14} className="text-indigo-600" />}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Mail size={12} />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-500 uppercase tracking-widest">
                    <ShieldCheck size={12} />
                    {user.role}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-700">Active Now</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="py-20 text-center">
          <UsersIcon size={40} className="mx-auto text-slate-100 mb-6" />
          <h3 className="text-xl font-bold text-slate-900">No team members found</h3>
          <p className="text-slate-400 font-medium">Wait for users to sign up to the platform</p>
        </div>
      )}
    </div>
  );
};
