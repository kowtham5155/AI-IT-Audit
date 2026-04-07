import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Settings from './components/Settings';
import AuditChat from './components/AuditChat';
import Reports from './components/Reports';
import StartAudit from './components/StartAudit';
import { AnimatePresence, motion } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebase-utils';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeAuditId, setActiveAuditId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState({
    name: '',
    role: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser({ name: '', role: '', email: '', bio: '' });
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !isLoggedIn || !auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', auth.currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            name: data.name || 'Auditor',
            role: data.role || 'Lead Auditor',
            email: data.email || auth.currentUser?.email || '',
            bio: data.bio || ''
          });
        } else {
          // Fallback if profile doesn't exist yet
          setUser({
            name: auth.currentUser?.displayName || 'Auditor',
            role: 'Lead Auditor',
            email: auth.currentUser?.email || '',
            bio: ''
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, isLoggedIn]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleAuditComplete = (auditId?: string) => {
    setActiveAuditId(auditId);
    setActiveTab('dashboard');
  };

  // Simple routing logic
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'settings':
        return <Settings user={user} setUser={setUser} />;
      case 'chat':
        return <AuditChat auditId={activeAuditId} />;
      case 'reports':
        return <Reports />;
      case 'audit':
        return <StartAudit onComplete={handleAuditComplete} />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System Overview';
      case 'settings': return 'System Configuration';
      case 'chat': return 'AI Audit Assistant';
      case 'reports': return 'Infrastructure Reports';
      case 'audit': return 'Audit Engine';
      default: return 'Sovereign Audit';
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <Topbar title={getTitle()} user={user} />
        
        <div className="mt-16 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
