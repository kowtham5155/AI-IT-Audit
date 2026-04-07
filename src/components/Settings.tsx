import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Save, 
  Bell, 
  Sun, 
  Moon, 
  Info, 
  Key, 
  Copy, 
  RefreshCw, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface SettingsProps {
  user: { name: string; role: string; email: string; bio?: string };
  setUser: (user: any) => void;
}

export default function Settings({ user, setUser }: SettingsProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    bio: user?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: formData.name,
        role: formData.role,
        bio: formData.bio
      });
      setUser({ ...user, name: formData.name, role: formData.role, bio: formData.bio });
      alert('Settings updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl">Configure your auditing environment, manage system preferences, and control security integrations.</p>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest ambient-shadow rounded-xl p-8"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container group relative">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiU-lrdwKvaWXVfFnnaBMZ27ZkyTpoKsuEqm1AaF1odiQZG3YuUPyZ_6pB9V3gWbKBc1z_sdYx0vgcuZxxOMyyqlVoFY5n05qPdHI2vHdD8-DGpuHUyRuUN3WrpSEx14Ffg_DLoaXEsxQop4dR4LDWB221pRQWR6cjFRfYzfnqkmCn597ZIUUQ5usuVujbf4D8rZOr5fpb9aOQ_vJvAMt5uNJqFtII2btxVp8ihh5YtCN_detQHaITlfoQ0nNbFFZF9gI4qJ9eJQ" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline">Profile Information</h3>
                  <p className="text-sm text-on-surface-variant">Update your personal and professional details.</p>
                </div>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all px-4 py-3 text-sm" 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all px-4 py-3 text-sm opacity-50 cursor-not-allowed" 
                  type="email" 
                  value={formData.email} 
                  disabled
                  title="Email cannot be changed here"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</label>
                <input 
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all px-4 py-3 text-sm" 
                  type="text" 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Professional Bio</label>
                <textarea 
                  className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all px-4 py-3 text-sm resize-none" 
                  rows={3} 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest ambient-shadow rounded-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell size={24} className="text-primary" />
              <h3 className="text-xl font-bold font-headline">Notification Settings</h3>
            </div>
            <div className="space-y-6">
              {[
                { title: 'Critical Incident Alerts', desc: 'Immediate push notifications for high-risk vulnerabilities.', active: true },
                { title: 'Weekly Audit Digest', desc: 'A summary of all scans and performance metrics every Monday.', active: false },
                { title: 'Feature Previews', desc: 'Be the first to know about new AI models and tools.', active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                  <button className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    item.active ? "bg-primary" : "bg-surface-container-highest"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                      item.active ? "right-1" : "left-1"
                    )}></div>
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-8">
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container-lowest ambient-shadow rounded-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sun size={24} className="text-primary" />
              <h3 className="text-xl font-bold font-headline">System Preferences</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Interface Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center gap-2 transition-all">
                    <Sun size={18} className="text-primary" />
                    <span className="text-sm font-bold text-primary">Light Theme</span>
                  </button>
                  <button className="p-4 rounded-lg border border-outline-variant/20 flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all">
                    <Moon size={18} />
                    <span className="text-sm font-bold">Dark Theme</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Audit Frequency</label>
                <select className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg transition-all px-4 py-3 text-sm appearance-none">
                  <option>Continuous Real-time</option>
                  <option>Daily at 12:00 AM</option>
                  <option>Every 6 Hours</option>
                  <option>On Demand Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Data Retention Policy</label>
                <div className="bg-tertiary-container/20 p-4 rounded-lg border border-tertiary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-on-tertiary-container">90 Days Active Log</span>
                    <Info size={14} className="text-on-tertiary-container" />
                  </div>
                  <p className="text-[11px] text-on-tertiary-container/80 leading-relaxed">
                    All detailed audit logs are retained for 90 days. Aggregated metadata is kept indefinitely for trend analysis.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest ambient-shadow rounded-xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Key size={24} className="text-primary" />
                  <h3 className="text-xl font-bold font-headline">API Access</h3>
                </div>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                  <Plus size={14} />
                  Generate New
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-surface rounded-xl border border-surface-variant/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-headline">Production Gateway</span>
                    <span className="text-[10px] px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-full font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[10px] text-on-surface-variant font-mono truncate max-w-[200px]">sk_prod_5592_xxxx_xxxx_7721</code>
                    <button className="text-on-surface-variant hover:text-primary transition-colors"><Copy size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-surface-variant/20 flex items-center gap-2">
                <ShieldCheck size={18} className="text-error" />
                <p className="text-[10px] text-on-surface-variant italic">Never share your API keys in public repositories or client-side code.</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <footer className="mt-12 flex justify-end gap-4">
        <button className="px-6 py-3 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Discard Changes</button>
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 primary-gradient text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">Update Settings</button>
      </footer>
    </div>
  );
}
