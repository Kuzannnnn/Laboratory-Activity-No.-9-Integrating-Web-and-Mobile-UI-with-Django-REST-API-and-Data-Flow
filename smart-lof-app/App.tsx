import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, StatusBar, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { VitalCard } from './components/VitalCard';
import { InferenceLog } from './components/InferenceLog';

export default function App() {
  const [vitals, setVitals] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState("002");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const BASE_URL = "http://192.168.100.213:8000/api";
  const AUTH_TOKEN = "df970a04d0d0c04b987b93828beb144a641e7b07"; 

  const fetchWithAuth = (url: string, options: any = {}) => {
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
    } catch (e: any) {
      setError("Bioreactor Link Failed. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [selectedBatch]);

  // --- CRUD OPERATIONS ---
  
  // STEP 3: POST (Create)
  const handleAddBatch = async () => {
    const nextNum = vitals?.all_batches ? (vitals.all_batches.length + 1).toString().padStart(3, '0') : "001";
    try {
      const response = await fetchWithAuth(`${BASE_URL}/create-batch/`, {
        method: 'POST',
        body: JSON.stringify({ batch_number: nextNum })
      });
      if (response.ok) {
        setSelectedBatch(nextNum);
        Alert.alert("Success", `Batch ${nextNum} initialized.`);
      }
    } catch (e) {
      Alert.alert("Error", "Check API connection.");
    }
  };

  // STEP 4: PATCH (Update) - Manual Actuator Toggle
  const toggleActuator = async () => {
    if (!vitals) return;
    const currentMotorState = vitals.motor;
    
    try {
      const response = await fetchWithAuth(`${BASE_URL}/update-batch/${selectedBatch}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_motor_active: !currentMotorState })
      });

      if (response.ok) {
        // Optimistic UI update or wait for next poll
        fetchData();
        Alert.alert("System Update", `Actuator ${!currentMotorState ? 'Started' : 'Stopped'} via API.`);
      }
    } catch (e) {
      Alert.alert("Update Failed", "Could not send command to Inference Engine.");
    }
  };

  // STEP 5: DELETE
  const handleDelete = async (id: string) => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/delete-batch/${id}/`, { method: 'DELETE' });
      if (response.ok) {
        setSelectedBatch("001");
        fetchData();
        Alert.alert("Deleted", `Batch ${id} removed.`);
      }
    } catch (e) {
      Alert.alert("Error", "Server unreachable.");
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Batch", `Remove Batch ${id}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(id) }
    ]);
  };

  if (loading && !vitals) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-4 font-black text-slate-400 uppercase tracking-[3px] text-[9px]">Handshake Active...</Text>
      </View>
    );
  }

  const currentTemp = parseFloat(vitals?.temp) || 0;
  const days_elapsed = vitals?.days_elapsed ?? 0;
  const progressPercent = Math.min((days_elapsed / 14) * 100, 100);
  const isAlert = vitals?.alerts && vitals.alerts.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      {error && (
        <View className="bg-amber-500 py-2 px-4 items-center">
          <Text className="text-white font-bold text-[10px]">{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6 flex-row justify-between items-start">
          <View>
            <Text className="text-4xl font-black text-slate-900 tracking-tighter">Smart-LOF</Text>
            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">System Administrator</Text>
          </View>
          <View className={`px-3 py-1 rounded-full flex-row items-center ${error ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
             <View className={`w-1.5 h-1.5 rounded-full mr-2 ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
             <Text className={`font-black text-[8px] uppercase ${error ? 'text-red-600' : 'text-emerald-600'}`}>{error ? 'Severed' : 'Live'}</Text>
          </View>
        </View>

        {/* Vat Management */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Vat Management</Text>
            <TouchableOpacity onPress={handleAddBatch}><Text className="text-emerald-600 font-bold text-xs">+ Add New</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {vitals?.all_batches?.map((b: any) => (
              <TouchableOpacity key={b.batch_number} onPress={() => setSelectedBatch(b.batch_number)} onLongPress={() => confirmDelete(b.batch_number)}
                className={`mr-3 px-6 py-4 rounded-[25px] border ${selectedBatch === b.batch_number ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-100'}`}>
                <Text className={`font-black text-xs ${selectedBatch === b.batch_number ? 'text-white' : 'text-slate-400'}`}>BATCH {b.batch_number}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Phase Progress */}
        <View className="bg-emerald-600 p-8 rounded-[40px] mb-6 shadow-2xl shadow-emerald-200">
          <Text className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Biological Phase</Text>
          <Text className="text-white text-4xl font-black mt-2 tracking-tighter">{vitals?.stage}</Text>
          <View className="mt-8 bg-emerald-800/40 h-2.5 rounded-full overflow-hidden">
            <View className="bg-emerald-300 h-full" style={{ width: `${progressPercent}%` }} />
          </View>
        </View>

        {/* Sensor Grid */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <VitalCard label="Temp" value={vitals?.temp ?? "--"} unit="°C" color={currentTemp > 45 ? "text-orange-500" : "text-slate-800"} />
          <VitalCard label="Acidity" value={vitals?.ph ?? "--"} unit="pH" color="text-indigo-600" />
        </View>

        {/* Prescribed Action & Interactive Actuator Control (STEP 4) */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={toggleActuator}
          className={`p-8 rounded-[40px] border-2 shadow-sm ${vitals?.motor ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Prescribed Action</Text>
            <View className={`px-2 py-0.5 rounded-md ${vitals?.motor ? 'bg-blue-600' : 'bg-slate-200'}`}>
              <Text className={`text-[8px] font-bold ${vitals?.motor ? 'text-white' : 'text-slate-500'}`}>TAP TO OVERRIDE</Text>
            </View>
          </View>
          
          <Text className={`text-xl font-black leading-7 ${vitals?.motor ? 'text-blue-900' : 'text-slate-800'}`}>
            {vitals?.action}
          </Text>
          
          <View className="mt-6 pt-6 border-t border-slate-100 flex-row items-center justify-between">
            <Text className="text-[10px] font-black text-slate-400 uppercase">
              Actuator Status: {vitals?.motor ? 'ACTIVE (PULSING)' : 'STANDBY'}
            </Text>
            <Text className="text-2xl">{vitals?.motor ? '🌀' : '💤'}</Text>
          </View>
        </TouchableOpacity>

        <InferenceLog logs={vitals?.logs || []} />
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}