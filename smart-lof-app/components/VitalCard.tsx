import React from 'react';
import { View, Text } from 'react-native';

export const VitalCard = ({ label, value, unit, color = "text-slate-800", trend = "stable" }: any) => (
  <View className="bg-white/80 p-5 rounded-[32px] w-[48%] border border-white/20 shadow-xl shadow-slate-200">
    <View className="flex-row justify-between items-start mb-2">
      <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[1px]">{label}</Text>
      <Text className={`text-[10px] ${trend === 'up' ? 'text-orange-500' : 'text-emerald-500'}`}>
        {trend === 'up' ? '▲' : '▼'}
      </Text>
    </View>
    <View className="flex-row items-baseline">
      <Text className={`text-4xl font-black ${color}`}>{value}</Text>
      <Text className="text-slate-400 font-bold ml-1 text-[10px] uppercase">{unit}</Text>
    </View>
  </View>
);