import React from 'react';

const StatusBadge = ({ stage }) => {
  const getStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'text-green-600 bg-green-100 border-green-200';
      case 'COMPLETE': return 'text-sky-600 bg-sky-100 border-sky-200';
      case 'OFFLINE': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className={`px-4 py-1.5 rounded-full font-bold text-xs border tracking-wider ${getStyles(stage)}`}>
      {stage?.toUpperCase() || 'UNKNOWN'}
    </div>
  );
};

export default StatusBadge;