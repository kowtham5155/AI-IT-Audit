import React, { useState, useEffect } from 'react';
import { 
  Download, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  ChevronRight,
  Plus,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

export default function Reports() {
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'audits'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAudits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort descending by createdAt
      fetchedAudits.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setAudits(fetchedAudits);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'audits');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const latestAudit = audits.length > 0 ? audits[0] : null;

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-on-surface-variant">Loading reports...</div>;
  }

  if (!latestAudit) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-10">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <h2 className="text-xl font-bold font-headline mb-2">No Audits Found</h2>
        <p className="text-sm">Start a new audit session to generate reports.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-10 py-12 scroll-smooth">
      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        {/* Report Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-primary font-bold text-xs tracking-widest uppercase mb-2 block">LATEST AUDIT REPORT</span>
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">{latestAudit.targetUrl}</h2>
            <p className="text-on-surface-variant text-sm font-medium">
              Report ID: {latestAudit.id.substring(0, 8).toUpperCase()} • 
              Generated {latestAudit.createdAt ? new Date(latestAudit.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-on-surface-variant uppercase mb-1">Audit Status</div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase",
              latestAudit.status === 'Running' ? "bg-primary/10 text-primary" : "bg-tertiary-container text-on-tertiary-container"
            )}>
              {latestAudit.status}
            </span>
          </div>
        </div>

        {/* Risk Score & Key Findings */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between relative overflow-hidden ambient-shadow"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div>
              <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-wider mb-8">Infrastructure Risk Score</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black text-on-surface tracking-tighter">{latestAudit.riskScore}</span>
                <span className="text-on-surface-variant font-medium text-lg">/100</span>
              </div>
              <p className={cn(
                "text-sm font-medium mt-2",
                latestAudit.riskScore > 70 ? "text-error" : latestAudit.riskScore > 40 ? "text-[#F57F17]" : "text-primary"
              )}>
                {latestAudit.riskScore > 70 ? "High Risk Exposure" : latestAudit.riskScore > 40 ? "Moderate Risk Exposure" : "Low Risk Exposure"}
              </p>
            </div>
            <div className="mt-12 space-y-4">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${latestAudit.riskScore}%` }}
                  transition={{ duration: 1.5 }}
                  className={cn(
                    "h-full",
                    latestAudit.riskScore > 70 ? "bg-error" : latestAudit.riskScore > 40 ? "bg-gradient-to-r from-[#F57F17] to-primary" : "bg-primary"
                  )}
                ></motion.div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Score calculated based on {latestAudit.auditType} intelligence model.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 ambient-shadow"
          >
            <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-wider mb-6">Key Findings</h3>
            <div className="space-y-6">
              {[
                { title: 'Legacy SSL Termination', desc: 'Edge nodes in Region-US-East are utilizing deprecated TLS 1.1 protocols for external load balancers.', severity: 'HIGH', icon: AlertCircle, color: 'text-error', bg: 'bg-error-container/10' },
                { title: 'Zombie IAM Roles', desc: '42 privileged accounts have not been used in 90+ days. Potential for lateral movement escalation.', severity: 'MEDIUM', icon: AlertTriangle, color: 'text-[#F57F17]', bg: 'bg-[#FFF9C4]/40' },
                { title: 'Unoptimized VPC Peering', desc: 'Redundant cross-region peering detected. Consolidating could reduce latency by 15ms.', severity: 'LOW', icon: Info, color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
              ].map((finding, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn(finding.bg, "p-2 rounded-lg")}>
                    <finding.icon size={20} className={finding.color} fill="currentColor" fillOpacity={0.1} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-on-surface">{finding.title}</h4>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded tracking-wide",
                        finding.severity === 'HIGH' ? 'bg-error-container text-on-error-container' : 
                        finding.severity === 'MEDIUM' ? 'bg-[#FFF9C4] text-[#F57F17]' : 'bg-tertiary-container text-on-tertiary-container'
                      )}>{finding.severity}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{finding.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Audit Scope & Methodology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <section>
            <h3 className="text-lg font-bold text-on-surface mb-4">Audit Scope</h3>
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This assessment covers the target infrastructure: <strong>{latestAudit.targetUrl}</strong>. The scope specifically includes:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Depth: {latestAudit.scope}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Intelligence Model: {latestAudit.auditType}
                </li>
              </ul>
            </div>
          </section>
          <section>
            <h3 className="text-lg font-bold text-on-surface mb-4">Methodology</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Our proprietary Sovereign Observer methodology combines automated heuristic scanning with manual verification of critical escalation paths. 
            </p>
            <div className="bg-surface-container-low rounded-lg p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase">POWERED BY SENTINEL AI</p>
                <p className="text-xs text-on-surface-variant italic">"All findings are cross-referenced against CIS Benchmarks v8.0 and NIST 800-53 frameworks."</p>
              </div>
            </div>
          </section>
        </div>

        {/* Remediation Roadmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-xl p-10 border-l-4 border-primary ambient-shadow"
        >
          <h3 className="text-xl font-bold text-on-surface mb-8">Remediation Roadmap</h3>
          <div className="space-y-6">
            {[
              { title: 'Deprecate TLS 1.1 across all Load Balancers', meta: 'Estimated effort: 2 hours • Immediate Priority' },
              { title: 'Execute automated IAM role pruning script', meta: 'Estimated effort: 1 hour • Scheduled for Monday' },
              { title: 'Rotate root access keys for secondary VPC', meta: 'Estimated effort: 30 mins • Routine Maintenance' },
              { title: 'Implement cross-account S3 bucket locking', meta: 'Estimated effort: 4 hours • Critical Hardening' },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                <div className="flex-1">
                  <span className="block text-sm font-bold text-on-surface">{item.title}</span>
                  <span className="block text-xs text-on-surface-variant">{item.meta}</span>
                </div>
                <ChevronRight size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </label>
            ))}
          </div>
        </motion.div>

        {/* Footer Summary */}
        <footer className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-outline-variant/10 text-on-surface-variant text-[10px] uppercase font-bold tracking-[0.2em] gap-4">
          <div className="flex gap-8">
            <span>CONFIDENTIAL - INTERNAL ONLY</span>
            <span>COPYRIGHT 2024 SOVEREIGN AUDIT</span>
          </div>
          <div>PAGE 01 / 14</div>
        </footer>
      </div>

      {/* Sticky FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 primary-gradient text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all md:hidden">
        <Plus size={24} />
      </button>
    </div>
  );
}
