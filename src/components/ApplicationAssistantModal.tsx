import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileEdit, 
  Search, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { Job } from '../types/index.ts';
import { AntiFabricationBadge } from './AntiFabricationBadge.tsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSelectJobForAnalysis?: (jobId?: string) => void;
}

export const ApplicationAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Find or Paste Job',
      description: 'Search curated developer jobs or paste any posting from LinkedIn / company careers.',
      action: () => {
        onNavigate('jobs');
        onClose();
      },
      actionLabel: 'Go to Find Jobs'
    },
    {
      step: 2,
      title: 'Analyze Profile Match',
      description: 'Run our transparent matching engine to view exact evidence citations and identify genuine gaps.',
      action: () => {
        onNavigate('jobs');
        onClose();
      },
      actionLabel: 'Select Job to Analyze'
    },
    {
      step: 3,
      title: 'Tailor Your CV Honestly',
      description: 'Highlight your verified skills and real project accomplishments without fabricating data.',
      action: () => {
        onNavigate('cv');
        onClose();
      },
      actionLabel: 'View Tailored CVs'
    },
    {
      step: 4,
      title: 'Generate Application Q&A',
      description: 'Answer tricky hiring portal questions (e.g. "Why should we hire you?") grounded in your real background.',
      action: () => {
        onNavigate('answers');
        onClose();
      },
      actionLabel: 'Open Application Q&A'
    },
    {
      step: 5,
      title: 'Apply & Track Progress',
      description: 'Submit your authentic application on the employer’s official website and track interview stages in Kanban.',
      action: () => {
        onNavigate('applications');
        onClose();
      },
      actionLabel: 'Open Application Tracker'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Job Hunter AI Workflow Assistant</h2>
              <p className="text-[11px] text-indigo-200">Ethical step-by-step application guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AntiFabricationBadge />

          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className={`p-4 rounded-xl border transition-all ${
                  activeStep === s.step
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        activeStep === s.step
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={s.action}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 pt-0.5 cursor-pointer"
                  >
                    <span>{s.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Responsible AI Policy:</span>
            We do not mass-spam or submit applications without your manual review. You inspect every tailored CV, confirm answers, and submit directly on the company’s portal.
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
