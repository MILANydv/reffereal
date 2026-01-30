'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Key, Calendar, Shield, Settings, Bell, Lock, Globe, Save, RefreshCw, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/Skeleton';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
}

type ProfileSection = 'profile' | 'settings' | 'account';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    marketingEmails: false,
    language: 'en',
    timezone: 'UTC',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm({ name: data.name || '', email: data.email });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Only send name, not email (email is read-only)
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileForm.name }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement settings API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sidebarItems = [
    { id: 'profile' as ProfileSection, label: 'Profile', icon: User },
    { id: 'settings' as ProfileSection, label: 'Settings', icon: Settings },
    { id: 'account' as ProfileSection, label: 'Account', icon: Lock },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-500">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-500">Failed to load profile</div>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Card>
              <div className="p-2">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Account Type</div>
                          <div className="font-medium">
                            <Badge variant="default">{profile.role}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Status</div>
                          <div className="font-medium">
                            <Badge variant={profile.active ? 'success' : 'error'}>
                              {profile.active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Member Since</div>
                          <div className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                          <Mail size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Email Status</div>
                          <div className="font-medium">
                            <Badge variant={profile.emailVerified ? 'success' : 'error'}>
                              {profile.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          readOnly
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          placeholder="your@email.com"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Email cannot be changed. Contact support if you need to update your email address.
                        </p>
                        {!profile.emailVerified && (
                          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                            Your email is not verified. Please check your inbox for the verification link.
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} className="mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>

                {isAdmin && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Information</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">User ID</div>
                          <div className="font-mono text-xs bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
                            {profile.id}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Role</div>
                          <div className="font-medium">Super Administrator</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2" size={20} />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive email notifications for important events</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.emailNotifications}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Marketing Emails</div>
                          <div className="text-sm text-gray-500">Receive updates about new features and promotions</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.marketingEmails}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, marketingEmails: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} className="mr-2" />
                              Save Settings
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2" size={20} />
                      Regional Settings
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Language
                        </label>
                        <select
                          value={settingsForm.language}
                          onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Timezone
                        </label>
                        <select
                          value={settingsForm.timezone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={18} className="mr-2" />
                              Save Settings
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Account Settings Section */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="mr-2" size={20} />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              <Key size={18} className="mr-2" />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>

                <Card className="border-red-200 dark:border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Delete Account</h4>
                        <p className="text-sm text-gray-500 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          type="button"
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          onClick={() => {
                            setDeleteEmailConfirm('');
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 w-full max-w-md animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Delete Account
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    This action cannot be undone. This will permanently delete your account and remove all of your data.
                  </p>
                </div>
              </div>
              {!isDeleting && (
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Type your email to confirm: <span className="font-mono text-xs text-gray-500">{profile?.email}</span>
                </label>
                <input
                  type="email"
                  value={deleteEmailConfirm}
                  onChange={(e) => {
                    setDeleteEmailConfirm(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  placeholder="Enter your email"
                  disabled={isDeleting}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {deleteEmailConfirm && deleteEmailConfirm !== profile?.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    Email does not match. Please type your email exactly as shown.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteEmailConfirm !== profile?.email) {
                    setError('Email does not match. Please type your email exactly as shown.');
                    return;
                  }

                  setIsDeleting(true);
                  setError('');
                  try {
                    // TODO: Implement account deletion API endpoint
                    const response = await fetch('/api/user/delete-account', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                    });

                    if (response.ok) {
                      // Redirect to login or home page
                      window.location.href = '/login';
                    } else {
                      const data = await response.json();
                      setError(data.error || 'Failed to delete account');
                      setIsDeleting(false);
                    }
                  } catch (error) {
                    setError('Failed to delete account. Please try again.');
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting || deleteEmailConfirm !== profile?.email}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={16} className="inline-block mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
