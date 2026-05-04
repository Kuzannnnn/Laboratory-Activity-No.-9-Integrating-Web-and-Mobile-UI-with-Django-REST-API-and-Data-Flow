import React from 'react';

const VitalCard = ({ label, value, unit, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-[30px] border border-slate-50 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-emerald-500 text-[10px]">▼</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black tracking-tighter ${colorClass}`}>{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
};

export default VitalCard;