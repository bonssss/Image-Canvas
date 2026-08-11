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

interface ProfileModalProps {
  onClose: () => void;
  onViewProfile?: (userIdOrUsername: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onViewProfile }) => {
  const { user, allUsers, switchUser, updateProfile, register, login, logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'register' | 'login' | 'switch'>(
    user ? 'profile' : 'login'
  );

  // Edit Profile fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regBio, setRegBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login field
  const [loginInput, setLoginInput] = useState('');

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
    if (!regEmail || !regUsername || !regFullName) {
      toast('Please fill out all required fields', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await register({
        email: regEmail.trim(),
        username: regUsername.trim(),
        fullName: regFullName.trim(),
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
    if (!loginInput.trim()) {
      toast('Please enter email or username', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedIn = await login(loginInput.trim());
      toast(`Signed in as ${loggedIn.fullName}`, { type: 'success' });
      setActiveTab('profile');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Sign in failed', { type: 'error' });
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

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 rounded-md bg-[#111111] hover:bg-black text-white dark:bg-white dark:text-[#111111] font-bold text-xs transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
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

      </div>
    </div>
  );
};
