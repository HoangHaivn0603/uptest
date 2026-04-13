import React from 'react';
import { Calendar as CalendarIcon, Download, Sun, Moon, MapPin, Settings, Newspaper, CircleDollarSign, Trophy, User } from 'lucide-react';
import { getAQIStatus } from '../../utils/weather';
import { cn } from '../../utils/helpers';

export default function CalendarHeader({ 
  isInstalled, 
  onInstallClick, 
  weather, 
  aqiData, 
  locationName, 
  loadingWeather, 
  onRefreshWeather, 
  onWeatherClick, 
  onSettingsClick,
  onNewsClick,
  onFinanceClick,
  onLotteryClick,
  user,
  onAuthClick,
  isDarkMode, 
  onToggleDarkMode 
}) {
  return (
    <header className="py-6 flex justify-between items-center bg-transparent">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-traditional-red flex items-center justify-center shadow-lg transform rotate-3">
           <CalendarIcon className="text-traditional-gold w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-traditional-red dark:text-traditional-gold tracking-tight">
          Lịch Việt
        </h1>
      </div>
      <div className="flex gap-2 items-center">
        {!isInstalled && (
          <button 
            onClick={onInstallClick}
            className="p-2 rounded-full glass hover:scale-110 transition-transform bg-traditional-red/5"
            title="Cài đặt ứng dụng"
          >
            <Download className="w-5 h-5 text-traditional-red animate-bounce-slow" />
          </button>
        )}
        {weather ? (
          <div 
            onClick={onWeatherClick}
            className="flex items-center gap-2 glass px-3 py-1.5 rounded-full animate-fade-in hover:bg-traditional-red/10 cursor-pointer transition-all active:scale-95"
          >
            <Sun className="w-4 h-4 text-traditional-red" /> 
            <div className="text-left leading-none">
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-black">{Math.round(weather.current.temperature_2m)}°C</p>
                <span className="text-[7px] text-gray-400 font-bold uppercase truncate max-w-[50px]">{locationName === 'Vị trí của bạn' ? 'Vị trí' : locationName}</span>
              </div>
              {aqiData && <p className={cn("text-[7px] font-bold mt-0.5", getAQIStatus(aqiData.us_aqi).color)}>AQI {aqiData.us_aqi}</p>}
            </div>
          </div>
        ) : (
          <button 
            onClick={onRefreshWeather}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full glass hover:bg-traditional-red/5 transition-all",
              loadingWeather && "animate-pulse opacity-50"
            )}
          >
            <MapPin className="w-3 h-3 text-traditional-red" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{loadingWeather ? '...' : 'Vị trí'}</span>
          </button>
        )}
        
        <button 
          onClick={onNewsClick}
          className="p-2 rounded-full glass hover:scale-110 transition-transform group"
          title="Tin tức 24h"
        >
          <Newspaper className="w-5 h-5 text-gray-400 group-hover:text-traditional-red transition-colors" />
        </button>

        <button 
          onClick={onFinanceClick}
          className="p-2 rounded-full glass hover:scale-110 transition-transform group"
          title="Tỷ giá & Giá vàng"
        >
          <CircleDollarSign className="w-5 h-5 text-gray-400 group-hover:text-traditional-red transition-colors" />
        </button>

        <button 
          onClick={onLotteryClick}
          className="p-2 rounded-full glass hover:scale-110 transition-transform group"
          title="Kết quả Xổ số"
        >
          <Trophy className="w-5 h-5 text-gray-400 group-hover:text-traditional-red transition-colors" />
        </button>

        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full glass hover:scale-110 transition-transform group"
          title="Cài đặt"
        >
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-traditional-red transition-colors" />
        </button>

        <button 
          onClick={onAuthClick}
          className={cn(
            "flex items-center gap-2 glass px-3 py-1.5 rounded-full hover:bg-traditional-red/10 transition-all group",
            user && "bg-traditional-red/5"
          )}
          title={user ? `Đăng xuất (${user.name})` : "Đăng nhập / Đăng ký"}
        >
          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <User className={cn("w-4 h-4", user ? "text-traditional-red" : "text-gray-400")} />
          </div>
          {user && (
            <span className="text-[10px] font-black text-traditional-red uppercase truncate max-w-[80px]">
              {user.name.split(' ').pop()}
            </span>
          )}
        </button>
        
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full glass hover:scale-110 transition-transform"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-traditional-gold" /> : <Moon className="w-5 h-5 text-traditional-red" />}
        </button>
      </div>
    </header>
  );
}
