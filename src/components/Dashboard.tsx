import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Video, 
  SignalHigh, 
  ShieldAlert, 
  TrendingUp, 
  MoreVertical, 
  ArrowRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

export default function Dashboard() {
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

  const totalAudits = audits.length;
  const avgRiskScore = totalAudits > 0 
    ? Math.round(audits.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / totalAudits)
    : 0;
  const activeAudits = audits.filter(a => a.status === 'Running').length;
  const totalHighVulns = audits.reduce((acc, curr) => acc + (curr.vulnerabilities?.high || 0), 0);

  const stats = [
    { label: 'Avg Risk Score', value: `${avgRiskScore}/100`, trend: '+12%', icon: ShieldAlert, color: 'text-error' },
    { label: 'Active Audits', value: activeAudits.toString(), status: 'Running', icon: Activity, color: 'text-primary' },
    { label: 'Total Audits', value: totalAudits.toString(), status: 'Stable', icon: Network, color: 'text-tertiary' },
    { label: 'High Vulns', value: totalHighVulns.toString(), status: 'Alert', icon: ShieldAlert, color: 'text-error' },
  ];

  const findings = [
    { issue: 'Insecure Firmware v2.04', target: '32 Sony Smart Cameras', severity: 'High', impact: 'Remote code execution risk', recommendation: 'Batch update to v2.10 stable' },
    { issue: 'Exposed Telnet Port', target: 'Cisco Edge Switch #4', severity: 'Medium', impact: 'Plaintext credential theft', recommendation: 'Disable Telnet; Force SSHv2' },
    { issue: 'Expired SSL Certificate', target: 'Internal Auth Portal', severity: 'Low', impact: 'Browser warning for users', recommendation: 'Renew via Let\'s Encrypt' },
    { issue: 'Default Admin Password', target: 'HID Door Controllers (8)', severity: 'High', impact: 'Unauthorized physical access', recommendation: 'Mandate rotation via policy' },
  ];

  return (
    <div className="p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest p-6 rounded-lg ambient-shadow flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-surface-container rounded-lg">
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.trend && <span className="text-xs font-bold text-tertiary px-2 py-1 bg-tertiary-container rounded-full">{stat.trend}</span>}
              {stat.status && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${
                  stat.status === 'Alert' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {stat.status}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{stat.label}</p>
              <h3 className="text-3xl font-bold font-headline mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Gauge and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Risk Gauge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-lg ambient-shadow flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#FFF9C4]"></div>
          <h2 className="text-lg font-bold font-headline mb-8 self-start">Overall Risk Level</h2>
          
          <div className="relative flex items-center justify-center">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle className="text-surface-container" cx="128" cy="128" fill="transparent" r="110" stroke="currentColor" strokeWidth="12"></circle>
              <motion.circle 
                initial={{ strokeDashoffset: 691 }}
                animate={{ strokeDashoffset: 691 - (691 * avgRiskScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="risk-gauge"
                cx="128" cy="128" fill="transparent" r="110" stroke="#F57F17" strokeLinecap="round" strokeWidth="12"
              ></motion.circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black font-headline text-[#F57F17]">{avgRiskScore}%</span>
              <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Moderate</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-8 w-full border-t border-outline-variant/10 pt-8">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Previous</p>
              <p className="text-lg font-headline font-bold">38%</p>
            </div>
            <div className="text-center border-x border-outline-variant/10 flex flex-col items-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Trend</p>
              <TrendingUp size={20} className="text-error" />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Target</p>
              <p className="text-lg font-headline font-bold">15%</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Audits List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 bg-surface-container-low p-8 rounded-lg flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold font-headline">Recent Audit Sessions</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-on-surface-variant text-sm">Loading audits...</div>
            ) : audits.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm">No audits found. Start a new audit to see data here.</div>
            ) : (
              audits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors border border-outline-variant/10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      audit.status === 'Running' ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"
                    )}>
                      {audit.status === 'Running' ? <Activity size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{audit.targetUrl}</p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                        <span className="uppercase tracking-wider">{audit.auditType}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span>{audit.createdAt ? new Date(audit.createdAt.toMillis()).toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-headline font-bold",
                      audit.riskScore > 70 ? "text-error" : audit.riskScore > 40 ? "text-tertiary" : "text-primary"
                    )}>{audit.riskScore}/100</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Risk Score</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="mt-6 self-end text-primary font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all group">
            VIEW ALL AUDITS 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Findings Table */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest rounded-lg ambient-shadow overflow-hidden"
      >
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline">Audit Findings</h2>
            <p className="text-sm text-on-surface-variant mt-1">24 vulnerabilities requiring immediate attention</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-surface-container text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container-high transition-colors">Export CSV</button>
            <button className="px-4 py-2 primary-gradient text-white text-sm font-bold rounded-lg shadow-sm active:scale-95 transition-all">Remediate All</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Issue</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Severity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Impact</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recommendation</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {findings.map((item, i) => (
                <tr key={i} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm">{item.issue}</p>
                    <p className="text-xs text-on-surface-variant">{item.target}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-black rounded-full uppercase",
                      item.severity === 'High' ? 'bg-error-container text-on-error-container' : 
                      item.severity === 'Medium' ? 'bg-[#FFF9C4] text-[#F57F17]' : 'bg-tertiary-container text-on-tertiary-container'
                    )}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm">{item.impact}</td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant">{item.recommendation}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-on-surface-variant hover:text-primary p-2 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container-low/30 text-center">
          <button className="text-sm font-bold text-primary hover:underline">View 20 more findings</button>
        </div>
      </motion.section>
    </div>
  );
}
