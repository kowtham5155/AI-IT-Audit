import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  User, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Code, 
  Database,
  Download,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface AuditChatProps {
  auditId?: string;
}

export default function AuditChat({ auditId }: AuditChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    let q;
    if (auditId) {
      q = query(
        collection(db, 'messages'),
        where('userId', '==', auth.currentUser.uid),
        where('auditId', '==', auditId),
        orderBy('createdAt', 'asc')
      );
    } else {
      q = query(
        collection(db, 'messages'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
      setIsLoading(false);
      scrollToBottom();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auditId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // 1. Save user message
      await addDoc(collection(db, 'messages'), {
        userId: auth.currentUser.uid,
        auditId: auditId || 'general',
        text: messageText,
        sender: 'user',
        createdAt: serverTimestamp()
      });

      // 2. Call Gemini API for real-time analysis
      try {
        // Initialize Gemini API
        // @ts-ignore - process.env is injected by the platform
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Fetch audit context if available
        let auditContext = "";
        if (auditId && auditId !== 'general') {
          const auditRef = doc(db, 'audits', auditId);
          const auditSnap = await getDoc(auditRef);
          if (auditSnap.exists()) {
            const auditData = auditSnap.data();
            auditContext = `Current Audit Context: Target: ${auditData.targetUrl}, Type: ${auditData.auditType}, Scope: ${auditData.scope}. `;
          }
        }

        // Build conversation history for context
        const history = messages.slice(-5).map(m => `${m.sender === 'user' ? 'Auditor' : 'Assistant'}: ${m.text}`).join('\n');

        const systemInstruction = `You are a Senior IT Infrastructure Security Auditor Assistant. 
Your job is to help the auditor analyze logs, identify vulnerabilities, suggest remediation steps, and provide expert guidance on network security, cloud infrastructure, IoT devices, and physical security.
Be concise, professional, and highly technical. Use markdown for formatting (e.g., code blocks for logs or commands).
${auditContext}`;

        const prompt = `${history}\nAuditor: ${messageText}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
          }
        });

        const aiResponseText = response.text || "I was unable to generate a response. Please try again.";

        // Save AI response
        await addDoc(collection(db, 'messages'), {
          userId: auth.currentUser?.uid,
          auditId: auditId || 'general',
          text: aiResponseText,
          sender: 'ai',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Failed to generate AI response", error);
        await addDoc(collection(db, 'messages'), {
          userId: auth.currentUser?.uid,
          auditId: auditId || 'general',
          text: "Error: Could not connect to the AI analysis engine. Please ensure your API key is configured correctly.",
          sender: 'ai',
          createdAt: serverTimestamp()
        });
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="flex-1 flex overflow-hidden p-6 gap-6 h-[calc(100vh-64px)]">
      {/* Left Column: AI Chat Interface */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bot size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-on-surface">Audit Assistant</h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Ready to assist
              </p>
            </div>
          </div>
          <button className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            EXPORT SESSION
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {isLoading ? (
             <div className="flex justify-center items-center h-full text-on-surface-variant">
               <Loader2 className="animate-spin mr-2" size={20} /> Loading chat history...
             </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
              <Bot size={48} className="mb-4" />
              <p>No messages yet. Start a conversation with the Audit Assistant.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={cn(
                  "flex gap-4 max-w-3xl",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                  msg.sender === 'user' ? "bg-secondary-container" : "bg-primary-container/20"
                )}>
                  {msg.sender === 'user' ? (
                    <User size={16} className="text-on-secondary-container" />
                  ) : (
                    <Sparkles size={16} className="text-primary" fill="currentColor" />
                  )}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl shadow-sm",
                  msg.sender === 'user' 
                    ? "bg-primary text-on-primary rounded-tr-none" 
                    : "bg-surface-container-low text-on-surface rounded-tl-none border border-surface-container/30"
                )}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-surface-container bg-surface-container-lowest">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-5 pr-32 text-sm focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all" 
              placeholder="Type your response or ask a question..." 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
            />
            <div className="absolute right-2 flex items-center gap-2">
              <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50" disabled={isSending}>
                <Paperclip size={20} />
              </button>
              <button 
                type="submit" 
                disabled={!newMessage.trim() || isSending}
                className="bg-primary hover:bg-primary-dim text-on-primary px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:active:scale-100"
              >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : 'SEND'} 
                {!isSending && <Send size={14} />}
              </button>
            </div>
          </form>
          <p className="text-[10px] text-center text-on-surface-variant mt-3 uppercase tracking-widest font-medium opacity-60">
            AI may generate incorrect info. Verify critical security findings.
          </p>
        </div>
      </div>

      {/* Right Column: Context Panels */}
      <div className="w-96 flex flex-col gap-6 h-full">
        {/* Audit Progress Tracker */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm overflow-hidden relative">
          <h3 className="font-headline font-bold text-sm mb-6 flex items-center gap-2">
            <Database size={16} className="text-primary" />
            Audit Progress
          </h3>
          <div className="space-y-0 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-surface-container"></div>
            {[
              { label: 'Scope Defined', time: 'Completed', status: 'completed' },
              { label: 'Network Security', time: 'Completed', status: 'completed' },
              { label: 'CCTV Security', time: 'In Progress...', status: 'current' },
              { label: 'Devices & IoT', time: 'Pending', status: 'pending' },
              { label: 'Access Control', time: 'Pending', status: 'pending' },
            ].map((step, i) => (
              <div key={i} className="relative flex gap-4 pb-8 last:pb-0 group">
                <div className={cn(
                  "z-10 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest",
                  step.status === 'completed' ? "bg-tertiary text-on-tertiary" : 
                  step.status === 'current' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container text-outline-variant"
                )}>
                  {step.status === 'completed' ? <Check size={14} strokeWidth={3} /> : <div className={cn("w-1.5 h-1.5 rounded-full", step.status === 'current' ? "bg-white" : "bg-outline-variant")}></div>}
                </div>
                <div>
                  <p className={cn("text-xs font-bold leading-none mb-1", step.status === 'current' ? "text-primary" : "text-on-surface")}>{step.label}</p>
                  <p className={cn("text-[10px]", step.status === 'current' ? "text-on-surface-variant italic" : "text-on-surface-variant")}>{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Extracted Data */}
        <div className="flex-1 bg-on-surface rounded-xl p-6 border border-on-surface shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-sm text-surface flex items-center gap-2">
              <Code size={16} className="text-secondary-container" />
              Live Extracted Data
            </h3>
            <div className="px-2 py-0.5 bg-secondary/20 text-secondary-container rounded text-[9px] font-bold tracking-widest border border-secondary/30">
              AUTO-SYNC
            </div>
          </div>
          <div className="flex-1 font-mono text-[11px] leading-relaxed overflow-y-auto no-scrollbar text-surface-variant">
            <pre>{`{
  "audit_context": "Physical_Security",
  "vlan_id": 104,
  "detected_assets": [
    {
      "id": "CAM-001",
      "vendor": "Hikvision",
      "auth": "local_admin",
      "risk_level": "High"
    },
    {
      "id": "CAM-002",
      "vendor": "Axis",
      "auth": "Active_Directory",
      "risk_level": "Low"
    }
  ],
  "vulnerabilities": {
    "mixed_auth_mode": true,
    "lateral_movement": "Checking..."
  }
}`}</pre>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <button className="flex-1 bg-surface-variant/10 hover:bg-surface-variant/20 text-surface text-[10px] font-bold py-2 rounded transition-colors uppercase tracking-wider">
              Copy JSON
            </button>
            <button className="flex-1 bg-primary text-on-primary text-[10px] font-bold py-2 rounded transition-colors uppercase tracking-wider">
              Push to DB
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
