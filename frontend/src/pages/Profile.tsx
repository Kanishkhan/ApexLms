import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateUserSuccess } from '../store/authSlice';
import { authService } from '../services/api';
import { User, Lock, Mail, ShieldAlert, CheckCircle, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageVariants } from '../animations/variants';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload: any = { name };
      if (password) payload.password = password;

      const res = await authService.updateProfile(payload);
      dispatch(updateUserSuccess(res.data));
      setSuccessMsg('Profile details updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const res = await authService.uploadAvatar(formData);
      dispatch(updateUserSuccess(res.data));
      setSuccessMsg('Profile avatar updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-xl mx-auto space-y-6 font-sans p-4 md:p-6 transition-all duration-300"
    >
      <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Account Settings</h1>
      
      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-200/30 flex items-center space-x-2 font-medium">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/30 flex items-center space-x-2 font-medium">
          <ShieldAlert className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Avatar Box card */}
      <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            alt={user.name}
            className="h-24 w-24 rounded-full border-2 border-brand-500 object-cover shadow-md"
          />
          
          <label className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full cursor-pointer hover:bg-brand-700 shadow shadow-brand-500/10 flex items-center justify-center">
            <Camera className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </label>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{user.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user.role} role</p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleUpdateProfile} className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-655 text-slate-600">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 opacity-60">
          <label className="text-xs font-semibold text-slate-600">Email Address (Cannot change)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              value={user.email}
              className="w-full pl-9 pr-4 py-2 border dark:border-slate-850 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs outline-none cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800/80 my-4" />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Update Password (Optional)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              placeholder="Leave blank to preserve current"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {password && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border dark:border-slate-800 bg-transparent rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                required={!!password}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center space-x-2 w-full py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-500/50 rounded-xl transition-all shadow-md shadow-brand-500/10"
        >
          {saving ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Save Settings Changes</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
