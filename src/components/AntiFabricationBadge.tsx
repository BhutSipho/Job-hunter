import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface Props {
  className?: string;
  compact?: boolean;
}

export const AntiFabricationBadge: React.FC<Props> = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Anti-Fabrication Guarantee
      </span>
    );
  }

  return (
    <div className={`p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2.5 ${className}`}>
      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-emerald-800">Strict Anti-Fabrication Guarantee: </span>
        Job Hunter AI strictly aligns with your verified profile. We never invent work experience, fake certifications, phantom employers, or exaggerated skills. When requirements are missing, we clearly flag them.
      </div>
    </div>
  );
};
