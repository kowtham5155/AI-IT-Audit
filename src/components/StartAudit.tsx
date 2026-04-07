import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Database, 
  Network, 
  Cpu, 
  Zap, 
  Check, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface StartAuditProps {
  onComplete?: (auditId?: string) => void;
}

export default function StartAudit({ onComplete }: StartAuditProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    auditName: '',
    targetType: 'cloud',
    targetUrl: '',
    auditType: 'advanced',
    scopeLevel: 4
  });

  const getScopeString = (level: number) => {
    switch(level) {
      case 1: return 'Surface (Level 1)';
      case 2: return 'Basic (Level 2)';
      case 3: return 'Standard (Level 3)';
      case 4: return 'Intense (Level 4)';
      case 5: return 'Deep Infrastructure (Level 5)';
      default: return 'Intense (Level 4)';
    }
  };

  const steps = [
    { id: 1, title: 'Scope Definition', icon: Search, desc: 'Identify target infrastructure and assets.' },
    { id: 2, title: 'Network Access', icon: Network, desc: 'Configure secure scanning protocols.' },
    { id: 3, title: 'Audit Engine', icon: Cpu, desc: 'Select AI models and heuristic depth.' },
    { id: 4, title: 'Initialize Scan', icon: Zap, desc: 'Review and start the auditing process.' },
  ];

  const nextStep = async () => {
    if (step === totalSteps) {
      // Submit to Firestore
      if (!auth.currentUser) return;
      setIsSubmitting(true);
      try {
        const docRef = await addDoc(collection(db, 'audits'), {
          userId: auth.currentUser.uid,
          targetUrl: formData.targetUrl || formData.auditName || 'Unnamed Audit',
          auditType: formData.auditType,
          scope: getScopeString(formData.scopeLevel),
          status: 'Running',
          riskScore: Math.floor(Math.random() * 40) + 10, // Initial mock score
          vulnerabilities: { high: 0, medium: 0, low: 0 },
          createdAt: serverTimestamp()
        });
        if (onComplete) onComplete(docRef.id);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'audits');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-10 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Initialize Audit Engine</h1>
              <p className="text-on-surface-variant text-sm mt-1">Configure your sovereign infrastructure scan parameters.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Step {step} of {totalSteps}</span>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                    "h-1.5 w-8 rounded-full transition-all duration-500",
                    i <= step ? "bg-primary" : "bg-surface-container-highest"
                  )}></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.id} className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-2",
                step === s.id ? "bg-surface-container-lowest border-primary shadow-sm" : "bg-transparent border-transparent opacity-40"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  step === s.id ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                )}>
                  <s.icon size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-surface-container-lowest rounded-2xl ambient-shadow p-10 min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-headline">What are we auditing today?</h2>
                  <p className="text-sm text-on-surface-variant">Select the primary infrastructure cluster for this session.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'cloud', label: 'Cloud Infrastructure', icon: Database, desc: 'AWS, Azure, GCP, or Hybrid clusters.' },
                    { id: 'iot', label: 'IoT & Edge Devices', icon: Cpu, desc: 'CCTV, Sensors, and Smart Controllers.' },
                    { id: 'network', label: 'Network Topology', icon: Network, desc: 'Switches, Routers, and VLAN security.' },
                    { id: 'physical', label: 'Physical Security', icon: ShieldCheck, desc: 'Access Control and Biometric systems.' },
                  ].map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setFormData({...formData, targetType: item.id})}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all text-left group",
                        formData.targetType === item.id ? "border-primary bg-primary/5" : "border-surface-container hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                        formData.targetType === item.id ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <item.icon size={24} />
                      </div>
                      <p className="font-bold text-on-surface mb-1">{item.label}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Audit Session Name</label>
                  <input 
                    type="text" 
                    value={formData.auditName}
                    onChange={(e) => setFormData({...formData, auditName: e.target.value})}
                    placeholder="e.g. Q4_Security_Review_US_EAST" 
                    className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-4 text-sm transition-all"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-headline">Network Access Configuration</h2>
                  <p className="text-sm text-on-surface-variant">Define how the Sovereign Observer will connect to your assets.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Secure Tunnel (Recommended)</p>
                        <p className="text-xs text-on-surface-variant">Encrypted peer-to-peer connection via WireGuard.</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-surface-container flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
                        <Activity size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Direct IP Access</p>
                        <p className="text-xs text-on-surface-variant">Requires whitelisting Sovereign IP ranges.</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-surface-container"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Gateway Address</label>
                    <input 
                      type="text" 
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                      placeholder="192.168.1.1" 
                      className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Port Range</label>
                    <input type="text" placeholder="80, 443, 8080-8090" className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg px-4 py-3 text-sm" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-headline">Audit Engine Parameters</h2>
                  <p className="text-sm text-on-surface-variant">Select the intelligence level and scanning depth.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Intelligence Model</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'standard', label: 'Standard', desc: 'Heuristic-based' },
                      { id: 'advanced', label: 'Advanced', desc: 'AI-Driven Analysis' },
                      { id: 'sovereign', label: 'Sovereign', desc: 'Full Deep-Scan' },
                    ].map((m) => (
                      <button 
                        key={m.id} 
                        onClick={() => setFormData({...formData, auditType: m.id})}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          formData.auditType === m.id ? "border-primary bg-primary/5" : "border-surface-container"
                        )}
                      >
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tight">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Scanning Depth</label>
                    <span className="text-xs font-bold text-primary">{getScopeString(formData.scopeLevel)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={formData.scopeLevel}
                    onChange={(e) => setFormData({...formData, scopeLevel: parseInt(e.target.value)})}
                    className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <span>Surface</span>
                    <span>Deep Infrastructure</span>
                  </div>
                </div>

                <div className="p-4 bg-tertiary-container/10 rounded-xl border border-tertiary/20 flex gap-4">
                  <div className="text-tertiary"><Check size={20} /></div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-on-surface">Estimated Duration: 14 minutes.</span> This scan will analyze 428 potential endpoints and cross-reference with 12,000+ known vulnerabilities.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center flex-1 text-center space-y-8"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  <ShieldCheck size={48} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-headline">Ready for Initialization</h2>
                  <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                    All parameters have been validated. The audit engine is primed for a deep-scan of your infrastructure.
                  </p>
                </div>

                <div className="w-full bg-surface-container-low rounded-xl p-6 text-left space-y-4 border border-surface-container">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-bold uppercase tracking-widest">Target Name</span>
                    <span className="font-bold">{formData.auditName || 'Unnamed Audit'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-bold uppercase tracking-widest">Scan Depth</span>
                    <span className="font-bold">{getScopeString(formData.scopeLevel)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-bold uppercase tracking-widest">Intelligence</span>
                    <span className="font-bold capitalize">{formData.auditType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-error text-[10px] font-bold uppercase tracking-widest">
                  <AlertTriangle size={14} />
                  <span>Scanning may impact network performance</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="mt-auto pt-10 flex justify-between items-center border-t border-outline-variant/10">
            <button 
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all",
                step === 1 ? "opacity-0 pointer-events-none" : "text-on-surface-variant hover:bg-surface-container",
                isSubmitting ? "opacity-50" : ""
              )}
            >
              <ChevronLeft size={18} /> BACK
            </button>
            
            <button 
              onClick={nextStep}
              disabled={isSubmitting}
              className="primary-gradient text-white px-8 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'INITIALIZING...' : (step === totalSteps ? 'START AUDIT' : 'CONTINUE')} 
              {!isSubmitting && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

