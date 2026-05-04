import React from 'react';

const InferenceLog = ({ logs }) => {
  return (
    <div className="mt-8">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4 px-2">
        Recent Inference Logs
      </h3>
      {(!logs || logs.length === 0) ? (
        <p className="text-sm italic text-slate-400 px-2">No recent system events...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log, i) => (
            <div key={i} className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InferenceLog;