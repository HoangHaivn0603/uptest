import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Wind, Sun, Thermometer, ShieldCheck, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudLightning, CloudSnow, CloudRain } from 'lucide-react';
import { format } from 'date-fns';
import { getDayDetails } from '../../../utils/lunar';
import { getAQIStatus, getUVLevel, getWeatherDescription, getWeatherIconName } from '../../../utils/weather';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

const WeatherIcon = ({ name, className }) => {
  const icons = { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudLightning, CloudSnow, CloudRain };
  const Icon = icons[name] || Cloud;
  return <Icon className={className} />;
};

export default function WeatherModal({ 
  isOpen, 
  onClose, 
  weather, 
  aqiData 
}) {
  if (!weather) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="weather-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Header / Current */}
            <div className={cn(
              "p-8 text-white relative",
              weather.current.weather_code === 0 ? "bg-gradient-to-br from-orange-500 to-traditional-gold" : "bg-gradient-to-br from-slate-700 to-slate-900"
            )}>
              <div className="flex justify-between items-start mb-8">
                <div>
                   <p className="text-sm font-bold opacity-80 mb-1">Thời tiết hiện tại</p>
                   <h3 className="text-3xl font-black font-serif italic">Tiết {getDayDetails(new Date()).solarTerm}</h3>
                </div>
                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-8">
                 <div className="p-4 bg-white/20 rounded-[2rem] backdrop-blur-md">
                   <WeatherIcon name={getWeatherIconName(weather.current.weather_code)} className="w-16 h-16 text-white" />
                 </div>
                 <div>
                    <p className="text-6xl font-black leading-none">{Math.round(weather.current.temperature_2m)}°</p>
                    <p className="text-lg font-bold mt-2">{getWeatherDescription(weather.current.weather_code)}</p>
                    <p className="text-xs opacity-70">Cảm giác như {Math.round(weather.current.apparent_temperature)}°</p>
                 </div>
              </div>

              {aqiData && (
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full animate-pulse", getAQIStatus(aqiData.us_aqi).bg)}></div>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Chỉ số không khí (AQI)</p>
                         <p className="text-sm font-bold">{getAQIStatus(aqiData.us_aqi).label} ({aqiData.us_aqi})</p>
                      </div>
                   </div>
                   <ShieldCheck className="w-5 h-5 opacity-40" />
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="p-6 grid grid-cols-2 gap-4">
               {[
                 { label: 'Độ ẩm', value: `${weather.current.relative_humidity_2m}%`, icon: Droplets, color: 'text-blue-500' },
                 { label: 'Sức gió', value: `${weather.current.wind_speed_10m} km/h`, icon: Wind, color: 'text-teal-500' },
                 { label: 'Chỉ số UV', value: getUVLevel(weather.daily.uv_index_max[0]).label, icon: Sun, color: 'text-orange-500' },
                 { label: 'Nhiệt độ cao', value: `${Math.round(weather.daily.temperature_2m_max[0])}°`, icon: Thermometer, color: 'text-red-500' }
               ].map((item, i) => (
                 <div key={i} className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className={cn("p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{item.label}</p>
                       <p className="text-sm font-black text-gray-800 dark:text-white leading-none">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Forecast */}
            <div className="p-6 pt-0">
               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Dự báo 3 ngày tới</p>
                  <div className="space-y-4">
                    {weather.daily.time.map((time, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3 w-28">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                              {i === 0 ? 'Hôm nay' : format(new Date(time), 'EEEE', { locale: { code: 'vi' } })}
                            </p>
                         </div>
                         <WeatherIcon name={getWeatherIconName(weather.daily.weather_code[i])} className="w-5 h-5 text-gray-400" />
                         <div className="flex items-center gap-3 w-20 justify-end">
                            <span className="text-sm font-black text-gray-700 dark:text-white">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                            <span className="text-sm font-medium text-gray-400">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-6 pt-2 pb-10 sm:pb-8 flex justify-center">
               <button 
                 onClick={onClose}
                 className="px-8 py-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold transition-all text-sm"
               >
                 Đóng
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
