import React, { useState } from 'react';
import {
  X,
  Edit3,
  UserPlus,
  LogIn,
  Users,
  Check,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

import { authService } from '../../services/authService';

interface ProfileModalProps {
  onClose: () => void;
  onViewProfile?: (userIdOrUsername: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onViewProfile }) => {
  const { user, allUsers, switchUser, updateProfile, register, login, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'register' | 'login' | 'switch' | 'forgot-password' | 'reset-password'>(
    user ? 'profile' : 'login'
  );

  // Edit Profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Change Password fields
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login field
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Forgot/Reset Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      setIsEditing(false);
      toast('Profile updated successfully', { type: 'success' });
    } catch {
      toast('Failed to update profile', { type: 'error' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regUsername || !regFullName || !regPassword || !regConfirmPassword) {
      toast('Please fill out all required fields', { type: 'error' });
      return;
    }
    
    if (regPassword !== regConfirmPassword) {
      toast('Passwords do not match', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await register({
        email: regEmail.trim(),
        username: regUsername.trim(),
        fullName: regFullName.trim(),
        password: regPassword,
        bio: regBio.trim(),
      });
      toast(`Welcome to PromptCanvas, ${newUser.fullName}!`, { type: 'success' });
      setActiveTab('profile');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Registration failed', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !loginPassword) {
      toast('Please enter email/username and password', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedIn = await login(loginInput.trim(), loginPassword);
      toast(`Signed in as ${loggedIn.fullName}`, { type: 'success' });
      setActiveTab('profile');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Sign in failed', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(forgotEmail);
      toast('Password reset link generated. Check console for token (Testing mode).', { type: 'success' });
      
      // Auto-fill token for testing convenience
      if (res.testToken) {
        setResetToken(res.testToken);
        console.log("TEST TOKEN:", res.testToken);
      }
      
      setActiveTab('reset-password');
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Failed to request reset', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) {
      toast('Passwords do not match', { type: 'error' });
      return;
    }
    try {
      setIsSubmitting(true);
      await authService.resetPassword(forgotEmail, resetToken, resetNewPassword);
      toast('Password reset successfully. Please log in.', { type: 'success' });
      setActiveTab('login');
      // Clear fields
      setResetNewPassword('');
      setResetConfirmPassword('');
      setResetToken('');
      setForgotEmail('');
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Failed to reset password', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast('New passwords do not match', { type: 'error' });
      return;
    }
    try {
      setIsSubmitting(true);
      await authService.changePassword(currentPassword, newPassword);
      toast('Password changed successfully', { type: 'success' });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Failed to change password', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#2e2e2e] rounded-xl shadow-2xl p-6 text-[#111111] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#e5e5e5] dark:border-[#2e2e2e] pb-2 text-xs">
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                  : 'text-[#767676] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              My Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold transition-colors ${
                  activeTab === 'register'
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'text-[#767676] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New User</span>
              </button>

              <button
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-bold transition-colors ${
                  activeTab === 'login'
                    ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                    : 'text-[#767676] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: MY PROFILE */}
        {activeTab === 'profile' && (
          <div>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={
                      user?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={user?.fullName || 'User'}
                    className="w-20 h-20 rounded-full object-cover border border-[#e5e5e5] dark:border-[#333333] mb-2.5 shadow-sm"
                  />
                  <h2 className="text-lg font-bold tracking-tight">{user?.fullName}</h2>
                  <p className="text-xs text-[#767676] font-mono mt-0.5">@{user?.username}</p>
                  <p className="text-xs text-[#767676]">{user?.email}</p>
                  {user?.bio && (
                    <p className="text-xs text-[#555555] dark:text-[#a0a0a0] mt-2 max-w-sm leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2e2e2e]">
                  <button
                    onClick={() => {
                      if (user && onViewProfile) {
                        onViewProfile(user.username);
                        onClose();
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-xs font-bold hover:bg-black transition-colors"
                  >
                    View Public Portfolio
                  </button>

                  <button
                    onClick={() => {
                      setFullName(user?.fullName || '');
                      setBio(user?.bio || '');
                      setAvatarUrl(user?.avatarUrl || '');
                      setIsEditing(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#f5f5f5] dark:bg-[#242424] text-[#111111] dark:text-white text-xs font-semibold hover:bg-[#e8e8e8] dark:hover:bg-[#303030] transition-colors border border-[#e5e5e5] dark:border-[#2e2e2e]"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3 animate-fadeIn">
                <div>
                  <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-3">
                    <img 
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-[#e5e5e5]" 
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await authService.updateProfilePhoto(file);
                            setAvatarUrl(res.avatarUrl);
                            toast('Photo updated successfully!', { type: 'success' });
                          } catch (err) {
                            toast('Failed to upload photo', { type: 'error' });
                          }
                        }
                      }}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-[#111111] file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#e5e5e5] dark:border-[#333333] mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 rounded-md bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setIsChangingPassword(false);
                    }}
                    className="py-1.5 px-3 rounded-md bg-[#f5f5f5] dark:bg-[#242424] text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {isEditing && !isChangingPassword && (
              <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="text-xs font-semibold text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  Change Password
                </button>
              </div>
            )}

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#333333] space-y-3 animate-fadeIn">
                <h3 className="text-xs font-bold mb-2">Change Password</h3>
                
                <div>
                  <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                      Confirm New
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 px-3 rounded-md bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="py-1.5 px-3 rounded-md bg-[#f5f5f5] dark:bg-[#242424] text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: REGISTER NEW REAL USER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 animate-fadeIn">
            <p className="text-xs text-[#767676]">
              Create a new user account with dedicated gallery, collections, and custom prompt history.
            </p>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="sarah_c"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Artist Bio
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Share your creative style or generative prompts..."
                className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account & Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SIGN IN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 animate-fadeIn">
            <p className="text-xs text-[#767676]">
              Sign in with your email or username to access your saved collections and generation history.
            </p>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. alex@promptcanvas.ai or alex_vance"
                className="w-full px-2.5 py-2 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-[#767676]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot-password')}
                  className="text-[10px] font-semibold text-[#767676] hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-2.5 py-2 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: FORGOT PASSWORD */}
        {activeTab === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 animate-fadeIn">
            <p className="text-xs text-[#767676]">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full px-2.5 py-2 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full py-2 px-4 rounded-lg bg-transparent text-[#767676] hover:text-[#111111] dark:hover:text-white text-xs font-semibold transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: RESET PASSWORD */}
        {activeTab === 'reset-password' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 animate-fadeIn">
            <p className="text-xs text-[#767676]">
              Enter the reset token from your email (or console for testing), and choose a new password.
            </p>

            <div>
              <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token here"
                className="w-full px-2.5 py-2 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111] font-mono text-[10px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-semibold text-[#767676] block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded-md bg-[#f8f8f8] dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333333] text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#111111]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
