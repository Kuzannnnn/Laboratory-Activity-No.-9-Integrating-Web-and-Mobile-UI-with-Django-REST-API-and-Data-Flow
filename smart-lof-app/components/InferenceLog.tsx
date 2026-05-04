import React from 'react';
import { View, Text } from 'react-native';

export const InferenceLog = ({ logs }: { logs: any[] }) => (
  <View className="mt-8">
    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] mb-4">
      Recent Inference Logs
    </Text>
    {logs.length === 0 ? (
      <Text className="text-slate-300 italic text-xs">No recent system events...</Text>
    ) : (
      logs.map((log: any) => (
        <View key={log.id} className="bg-white p-4 rounded-[25px] mb-3 border border-slate-100 flex-row items-center shadow-sm">
          <View className={`w-2 h-2 rounded-full mr-4 ${
            log.type === 'action' ? 'bg-blue-500' : 
            log.type === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'
          }`} />
          <View className="flex-1">
            <Text className="text-slate-800 font-bold text-sm">{log.event}</Text>
            <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-tighter">{log.time}</Text>
          </View>
        </View>
      ))
    )}
  </View>
);