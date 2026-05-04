import React, { useState, useEffect } from 'react';
import VitalCard from './components/VitalCard';
import InferenceLog from './components/InferenceLog';

export default function App() {
  const [vitals, setVitals] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("002");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  // Pointing to your Django server
  const BASE_URL = "http://127.0.0.1:8000/api";
  const AUTH_TOKEN = "df970a04d0d0c04b987b93828beb144a641e7b07"; 

  const fetchWithAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Token ${AUTH_TOKEN}`,
      },
    });
  };

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/latest-batch/?batch_id=${selectedBatch}`);
      if (!response.ok) throw new Error("Server communication error.");
      const data = await response.json();
      setVitals(data);
      setError(null);
    } catch (e) {
      setError("Bioreactor Link Failed. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 3000); // 3-second polling
    return () => clearInterval(interval);
  }, [selectedBatch]);

  // --- CRUD OPERATIONS ---
  const handleAddBatch = async () => {
    const nextNum = vitals?.all_batches ? (vitals.all_batches.length + 1).toString().padStart(3, '0') : "001";
    try {
      const response = await fetchWithAuth(`${BASE_URL}/create-batch/`, {
        method: 'POST',
        body: JSON.stringify({ batch_number: nextNum })
      });
      if (response.ok) {
        setSelectedBatch(nextNum);
        alert(`Success: Batch ${nextNum} initialized.`);
      }
    } catch (e) {
      alert("Error: Check API connection.");
    }
  };

  const toggleActuator = async () => {
    if (!vitals) return;
    const currentMotorState = vitals.motor;
    
    try {
      const response = await fetchWithAuth(`${BASE_URL}/update-batch/${selectedBatch}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_motor_active: !currentMotorState })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (e) {
      alert("Update Failed: Could not send command to Inference Engine.");
    }
  };

  const confirmDelete = (id) => {
    if (window.confirm(`Delete Batch: Remove Batch ${id}?`)) {
      handleDelete(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/delete-batch/${id}/`, { method: 'DELETE' });
      if (response.ok) {
        setSelectedBatch("001");
        fetchData();
      }
    } catch (e) {
      alert("Error: Server unreachable.");
    }
  };

  // --- Loading Screen ---
  if (loading && !vitals) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-[3px] text-[9px]">Handshake Active...</p>
      </div>
    );
  }

  // --- Calculations ---
  const currentTemp = parseFloat(vitals?.temp) || 0;
  const days_elapsed = vitals?.days_elapsed ?? 0;
  const progressPercent = Math.min((days_elapsed / 14) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 font-sans">
      
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-slate-50 h-[850px] max-h-[95vh] rounded-[45px] shadow-2xl overflow-hidden flex flex-col relative border-[6px] border-slate-300">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-amber-500 py-2 px-4 text-center z-50">
            <span className="text-white font-bold text-[10px]">{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-start pt-6 px-2">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Smart-LOF</h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px] mt-1">System Administrator</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${error ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
               <span className={`font-black text-[8px] uppercase tracking-widest ${error ? 'text-red-600' : 'text-emerald-600'}`}>
                 {error ? 'Severed' : 'Live'}
               </span>
            </div>
          </div>

          {/* Vat Management */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Vat Management</h2>
              <button onClick={handleAddBatch} className="text-emerald-600 font-bold text-xs hover:text-emerald-700 transition-colors">
                + Add New
              </button>
            </div>
            
            <div className="flex overflow-x-auto pb-2 gap-3 px-2" style={{ scrollbarWidth: 'none' }}>
              {vitals?.all_batches?.map((b) => (
                <button 
                  key={b.batch_number} 
                  onClick={() => setSelectedBatch(b.batch_number)}
                  onContextMenu={(e) => { e.preventDefault(); confirmDelete(b.batch_number); }}
                  className={`shrink-0 px-6 py-4 rounded-[25px] border transition-all ${
                    selectedBatch === b.batch_number 
                      ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-200' 
                      : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <span className={`font-black text-xs ${selectedBatch === b.batch_number ? 'text-white' : 'text-slate-400'}`}>
                    BATCH {b.batch_number}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Phase Progress */}
          <div className="bg-emerald-600 p-8 rounded-[40px] mb-6 shadow-2xl shadow-emerald-200/50">
            <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Biological Phase</p>
            <h2 className="text-white text-4xl font-black mt-2 tracking-tighter">
              {vitals?.stage || "OFFLINE"}
            </h2>
            <div className="mt-8 bg-emerald-800/40 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-300 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Sensor Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <VitalCard 
              label="Temp" 
              value={vitals?.temp ?? "--"} 
              unit="°C" 
              colorClass={currentTemp > 45 ? "text-orange-500" : "text-slate-800"} 
            />
            <VitalCard 
              label="Acidity" 
              value={vitals?.ph ?? "--"} 
              unit="pH" 
              colorClass="text-indigo-600" 
            />
          </div>

          {/* Prescribed Action */}
          <button 
            onClick={toggleActuator}
            className={`w-full text-left p-8 rounded-[40px] border-2 shadow-sm transition-all active:scale-[0.98] ${
              vitals?.motor ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-50'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Prescribed Action</span>
              <div className={`px-3 py-1 rounded-full ${vitals?.motor ? 'bg-blue-600' : 'bg-slate-100'}`}>
                <span className={`text-[8px] font-bold tracking-widest ${vitals?.motor ? 'text-white' : 'text-slate-500'}`}>
                  TAP TO OVERRIDE
                </span>
              </div>
            </div>
            
            <p className={`text-xl font-black leading-snug ${vitals?.motor ? 'text-blue-900' : 'text-slate-800'}`}>
              {vitals?.action || "Select a vat to monitor."}
            </p>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Actuator Status: {vitals?.motor ? 'ACTIVE (PULSING)' : 'STANDBY'}
              </span>
              <span className="text-2xl">{vitals?.motor ? '🌀' : '💤'}</span>
            </div>
          </button>

          {/* Logs */}
          <InferenceLog logs={vitals?.logs || []} />
          
          <div className="h-12"></div>
        </div>
      </div>
    </div>
  );
}