import React from 'react';
import { Moon, Quote, DollarSign, Heart, Activity, Star, CalendarPlus, Sparkles, Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudLightning, CloudSnow, CloudRain, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { getDayDetails } from '../../utils/lunar';
import { getAQIStatus, getWeatherDescription, getWeatherIconName } from '../../utils/weather';
import { getDailyWisdom } from '../../utils/wisdom';
import { isAuspiciousTruc } from '../../utils/lunar';
import { getCanChiFromYear, getCompatibility, getLuckyScores } from '../../utils/horoscope';
import { cn } from '../../utils/helpers';

const WeatherIcon = ({ name, className }) => {
  const icons = { Sun, Cloud, CloudSun, CloudFog, CloudDrizzle, CloudLightning, CloudSnow, CloudRain };
  const Icon = icons[name] || Cloud;
  return <Icon className={className} />;
};

import { useLiveClock } from '../../hooks/useLiveClock';

export function TodayWidget({ weather, aqiData, nextHoliday, onWeatherClick }) {
  const { now, currentCanChi, isLucky } = useLiveClock();
  const details = getDayDetails(now);
  
  return (
    <div className="mb-8 mt-2 animate-slide-up">
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-traditional-red to-traditional-red-dark p-[1px] shadow-2xl">
        <div className="bg-traditional-gold/10 backdrop-blur-xl rounded-[2.4rem] p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="flex gap-6 items-center">
            {/* Live Minimalist Clock */}
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col items-center justify-center border-b-4 border-traditional-red shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-traditional-gold rounded-t-3xl"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-traditional-red tabular-nums leading-none mb-1">
                  {format(now, 'HH:mm')}
                </span>
                <span className="text-[10px] font-black text-traditional-red opacity-40 tabular-nums leading-none">
                  {format(now, 'ss')}
                </span>
              </div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                Thứ {format(now, 'i') === '7' ? 'CN' : parseInt(format(now, 'i')) + 1}
              </p>
            </div>

            <div className="flex-1">
              {/* Current Can Chi Hour with Status */}
              <div className="flex items-center gap-2 mb-2">
                 <div className={cn(
                   "w-2 h-2 rounded-full animate-pulse",
                   isLucky ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400"
                 )}></div>
                 <span className="text-[10px] font-bold text-traditional-gold uppercase tracking-widest">
                   Giờ {currentCanChi.name} ({currentCanChi.range})
                 </span>
                 {isLucky && (
                   <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-tighter">Hoàng Đạo</span>
                 )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Ngày {details.lunar.date} tháng {details.lunar.month}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <p className="text-xs text-white/70 font-medium">Năm {details.lunar.canChiYear}</p>
                <p className="text-xs text-white/70 font-medium whitespace-nowrap">• Ngày {details.lunar.canChiDay}</p>
                <p className="text-xs text-traditional-gold font-bold">Tiết {details.solarTerm}</p>
              </div>
            </div>

            {weather && (
              <div 
                onClick={onWeatherClick}
                className="absolute top-6 right-6 text-right cursor-pointer hover:scale-105 transition-transform group hidden sm:block"
              >
                <div className="flex items-center justify-end gap-2 mb-1">
                   {aqiData && (
                     <div className={cn("px-1.5 py-0.5 rounded text-[7px] font-black text-white", getAQIStatus(aqiData.us_aqi).bg)}>
                       AQI {aqiData.us_aqi}
                     </div>
                   )}
                   <p className="text-3xl font-black text-white leading-none drop-shadow-md">
                     {Math.round(weather.current.temperature_2m)}°
                   </p>
                </div>
                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                   <p className="text-[9px] font-bold text-white uppercase tracking-wider">{getWeatherDescription(weather.current.weather_code)}</p>
                   <WeatherIcon name={getWeatherIconName(weather.current.weather_code)} className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>

          {nextHoliday && (
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-traditional-gold/20 rounded-xl">
                  <Sparkles className="w-4 h-4 text-traditional-gold animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mb-1">Ngày lễ sắp tới</p>
                  <p className="text-sm font-bold text-white leading-none">{nextHoliday.name}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black text-traditional-gold leading-none">{nextHoliday.daysLeft}</p>
                 <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Ngày nữa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WisdomCard() {
  const details = getDayDetails(new Date());
  const { quote, advice } = getDailyWisdom(new Date(), isAuspiciousTruc(details.truc));
  
  return (
    <div className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="glass rounded-[2rem] p-6 border-l-4 border-l-traditional-gold relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
           <Quote className="w-24 h-24 text-traditional-gold" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-traditional-gold">Thẻ Vạn Sự</span>
             <div className="h-[1px] flex-1 bg-traditional-gold/10"></div>
          </div>
          <div className="space-y-4">
            <p className="text-lg font-serif italic text-traditional-red-dark dark:text-traditional-gold font-bold leading-relaxed">
              “{quote}”
            </p>
            <div className="p-4 rounded-2xl bg-traditional-red/5 border border-traditional-red/5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Lời khuyên ngày mới</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{advice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PersonalizedForecast({ userYear }) {
  const userCC = getCanChiFromYear(userYear);
  if (!userCC) return null;
  
  const dayCC = getDayDetails(new Date()).lunar.canChiDay;
  const comp = getCompatibility(userCC.chi, dayCC);
  const scores = getLuckyScores(userYear, format(new Date(), 'yyyyMMdd'), comp);

  return (
    <div className="mb-6 animate-fade-in">
      <div className="glass rounded-[2rem] p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <CalendarPlus className="w-32 h-32 text-traditional-red" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-traditional-red/60">Dự báo của bạn</span>
          <div className="h-[1px] flex-1 bg-traditional-red/10"></div>
          <span className="text-[10px] font-bold text-gray-400">{userCC.fullName}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tài lộc', icon: DollarSign, color: 'text-yellow-600', score: scores.wealth },
            { label: 'Tình duyên', icon: Heart, color: 'text-red-500', score: scores.love },
            { label: 'Sức khỏe', icon: Activity, color: 'text-green-500', score: scores.health }
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-2xl bg-white/40 dark:bg-black/20">
              <item.icon className={cn("w-5 h-5 mx-auto mb-2", item.color)} />
              <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">{item.label}</p>
              <div className="flex justify-center gap-0.5">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className={cn("w-2 h-2", idx < item.score ? "text-traditional-gold fill-traditional-gold" : "text-gray-200 dark:text-gray-700")} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinanceStats({ goldPrices, exchangeRates, onFinanceClick }) {
  const topGold = goldPrices?.[0]; // SJC
  const topUSD = exchangeRates?.find(r => r.code === 'USD');

  return (
    <div 
      onClick={onFinanceClick}
      className="mb-6 animate-slide-up group cursor-pointer" 
      style={{ animationDelay: '300ms' }}
    >
      <div className="flex gap-4 items-center px-2">
        {/* Gold Mini Card */}
        <div className="flex-1 glass rounded-2xl p-3 flex items-center justify-between border-b-2 border-b-yellow-500 hover:bg-yellow-500/5 transition-colors text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-[7px]">Vàng SJC</p>
              <p className="text-xs font-black text-yellow-700 dark:text-yellow-500">{topGold ? topGold.sell : '...'}</p>
            </div>
          </div>
          <Activity className="w-4 h-4 text-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Currency Mini Card */}
        <div className="flex-1 glass rounded-2xl p-3 flex items-center justify-between border-b-2 border-b-blue-500 hover:bg-blue-500/5 transition-colors text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
              {topUSD ? topUSD.flag : '🇺🇸'}
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-[7px]">USD/VND</p>
              <p className="text-xs font-black text-blue-700 dark:text-blue-400">{topUSD ? topUSD.sell : '...'}</p>
            </div>
          </div>
          <DollarSign className="w-4 h-4 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export function LotteryWidget({ lotteryData, onLotteryClick }) {
  const specialPrize = lotteryData?.results?.['ĐB']?.[0] || '...';
  
  return (
    <div 
      onClick={onLotteryClick}
      className="mb-6 animate-slide-up group cursor-pointer" 
      style={{ animationDelay: '400ms' }}
    >
      <div className="glass rounded-[2rem] p-4 flex items-center justify-between border-l-4 border-l-traditional-red hover:bg-traditional-red/5 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-traditional-gold/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6 text-traditional-red" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-traditional-red uppercase tracking-widest">Xổ số miền Bắc</span>
               <span className="text-[8px] font-bold text-gray-400 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                 {lotteryData?.time || 'Cập nhật...'}
               </span>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-xs font-bold text-gray-500">Đặc Biệt:</p>
               <p className="text-xl font-black text-traditional-red tracking-[0.2em]">{specialPrize}</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-traditional-red/10 group-hover:bg-traditional-red transition-all">
           <span className="text-[8px] font-black text-traditional-red group-hover:text-white uppercase tracking-widest">Chi tiết</span>
        </div>
      </div>
    </div>
  );
}



