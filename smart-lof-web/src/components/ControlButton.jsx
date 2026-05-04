import React from 'react';

const ControlButton = ({ icon: Icon, label, onClick, variant = 'primary' }) => {
  const base = "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all active:scale-95";
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "text-red-600 hover:bg-red-50 font-semibold"
  };

  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick}>
      {Icon} {label}
    </button>
  );
};

export default ControlButton;