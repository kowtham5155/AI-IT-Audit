import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  Zap, 
  ShieldCheck, 
  Activity,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface LoginProps {
  onLogin: (userData: { name: string; email: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: formData.name || 'Auditor',
            email: user.email,
            role: 'Lead Auditor',
            createdAt: serverTimestamp()
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${user.uid}`);
        }

        setIsRegister(false);
        setFormData({ ...formData, password: '' });
        alert('Registration successful! Please sign in with your new account.');
      } else {
        // Login
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // onLogin will be handled by App.tsx listening to onAuthStateChanged
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please enable it in your Firebase Console (Authentication > Sign-in method), or use Google Sign-In below.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Try to create profile if it doesn't exist (setDoc with merge: true or just setDoc)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'Auditor',
          email: user.email,
          role: 'Lead Auditor',
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${user.uid}`);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in your Firebase Console.');
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };


  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex items-center justify-center p-8 overflow-hidden relative">
      {/* Background Abstract Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-container/10 blur-[120px]"></div>
        <div className="absolute -bottom-[5%] -right-[5%] w-[30%] h-[30%] rounded-full bg-tertiary-container/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Content (Hero) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col space-y-8 pr-12"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 primary-gradient rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight text-on-surface">Sovereign Audit</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-headline text-5xl font-extrabold tracking-tight leading-tight text-on-surface">
              Infrastructure <span className="text-primary">Intelligence</span> at Scale.
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              Join the industry standard for automated risk assessment and sovereign infrastructure auditing. Calm, authoritative, and precise.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-surface-container-low p-6 rounded-lg space-y-2">
              <ShieldCheck size={24} className="text-primary" />
              <p className="font-headline font-bold text-sm">Military Grade</p>
              <p className="text-xs text-on-surface-variant">Zero-trust architecture for all audit sessions.</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg space-y-2">
              <Activity size={24} className="text-primary" />
              <p className="font-headline font-bold text-sm">AI Insights</p>
              <p className="text-xs text-on-surface-variant">Automated anomaly detection across clusters.</p>
            </div>
          </div>

          <div className="pt-12 flex items-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">System Status: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">TLS 1.3 Encryption</span>
            </div>
          </div>
        </motion.div>

        {/* Right Content (Form) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-xl ambient-shadow">
            <div className="mb-8">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-on-surface-variant text-sm">
                {isRegister ? 'Start your 14-day professional trial.' : 'Secure authorization for institutional auditing protocols.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-3 text-error">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input 
                      className="w-full pl-7 py-3 bg-transparent border-b-2 border-surface-container focus:border-primary focus:ring-0 transition-colors placeholder:text-surface-dim outline-none text-sm" 
                      id="name" 
                      placeholder="Alex Sterling" 
                      type="text" 
                      value={formData.name}
                      onChange={handleChange}
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="email">Organization Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input 
                    className="w-full pl-7 py-3 bg-transparent border-b-2 border-surface-container focus:border-primary focus:ring-0 transition-colors placeholder:text-surface-dim outline-none text-sm" 
                    id="email" 
                    placeholder="alex@infrastructure.com" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1" htmlFor="password">
                    {isRegister ? 'Password' : 'Access Key'}
                  </label>
                  {!isRegister && <button type="button" className="text-xs font-semibold text-primary hover:underline">Forgot key?</button>}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input 
                    className="w-full pl-7 pr-10 py-3 bg-transparent border-b-2 border-surface-container focus:border-primary focus:ring-0 transition-colors placeholder:text-surface-dim outline-none text-sm" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3 py-2">
                <div className="flex items-center h-5">
                  <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20 cursor-pointer" id="terms" type="checkbox" required={isRegister} />
                </div>
                <div className="text-xs leading-relaxed text-on-surface-variant">
                  {isRegister ? (
                    <>I agree to the <button type="button" className="text-primary font-semibold hover:underline">Terms of Service</button> and <button type="button" className="text-primary font-semibold hover:underline">Privacy Policy</button>.</>
                  ) : (
                    <>Remember this workstation for 30 days</>
                  )}
                </div>
              </div>

              <button 
                disabled={isLoading}
                className="w-full primary-gradient text-white font-headline font-bold py-4 rounded-lg hover:opacity-90 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="pt-4 flex flex-col items-center space-y-4">
                <div className="w-full flex items-center space-x-4">
                  <div className="h-[1px] flex-grow bg-surface-container"></div>
                  <span className="text-[10px] uppercase tracking-widest text-surface-dim font-bold">OR</span>
                  <div className="h-[1px] flex-grow bg-surface-container"></div>
                </div>
                
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-surface-container-low border border-surface-container hover:bg-surface-container text-on-surface font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-3 text-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>

                <div className="text-sm text-on-surface-variant">
                  {isRegister ? 'Already have an account?' : 'New to Infrastructure Audit?'}
                  <button 
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    {isRegister ? 'Sign in' : 'Create an account'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-surface-dim">
        <span>© 2024 Sovereign Audit Inc.</span>
        <div className="w-1 h-1 bg-surface-dim rounded-full"></div>
        <span>Infrastructure Intelligence v4.2</span>
      </div>

      {/* Side Illustration (Floating Card) */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="hidden xl:flex fixed right-[5%] top-1/2 -translate-y-1/2 w-[25%] flex-col gap-6"
      >
        <div className="bg-surface-container-low/80 backdrop-blur-md rounded-xl p-8 border border-white/20 relative overflow-hidden ambient-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={80} />
          </div>
          <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider rounded-full mb-4">AI Insight</span>
          <blockquote className="font-headline text-xl font-semibold leading-relaxed text-on-surface">
            "Infrastructure transparency is the foundation of digital sovereignty. Secure your core."
          </blockquote>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
              <Monitor size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface uppercase tracking-tight">Observer Unit-7</p>
              <p className="text-[10px] text-on-surface-variant">Real-time Infrastructure Monitoring</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/50 backdrop-blur-md rounded-lg p-6 border border-white/20 ambient-shadow">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Audits</p>
            <p className="text-2xl font-headline font-bold text-primary">1,284</p>
          </div>
          <div className="flex-1 bg-white/50 backdrop-blur-md rounded-lg p-6 border border-white/20 ambient-shadow">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Threats Mitigated</p>
            <p className="text-2xl font-headline font-bold text-error">99.9%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
