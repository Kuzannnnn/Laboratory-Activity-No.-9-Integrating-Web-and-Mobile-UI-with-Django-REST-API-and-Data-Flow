import React from 'react';

const SensorCard = ({ icon: Icon, label, value, unit, colorClass, optimalRange }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>{Icon}</div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{label}</h2>
    </div>
    <div className="flex items-baseline gap-1">
      <p className="text-5xl font-black text-slate-900 tracking-tight">{value}</p>
      {unit && <span className="text-2xl font-bold text-slate-400">{unit}</span>}
    </div>
    <p className="text-xs text-slate-400 mt-3 italic">Optimal: {optimalRange}</p>
  </div>
);

export default SensorCard;