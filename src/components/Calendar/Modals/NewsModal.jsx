import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ExternalLink, Newspaper, Calendar, ChevronLeft, ArrowRight } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export default function NewsModal({ 
  isOpen, 
  onClose, 
  articles, 
  isRefreshing, 
  onRefresh,
  updatedAt,
  isCached
}) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [direction, setDirection] = useState(0);

  const handleArticleClick = (article) => {
    setDirection(1);
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setDirection(-1);
    setSelectedArticle(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="news-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-lg h-[90vh] sm:h-[85vh] bg-white dark:bg-gray-950 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {selectedArticle ? (
                    <button 
                      onClick={handleBackToList}
                      className="p-2 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-traditional-red hover:text-white transition-all group"
                    >
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="w-12 h-12 bg-traditional-red rounded-2xl flex items-center justify-center shadow-lg">
                      <Newspaper className="text-white w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black font-serif">
                      {selectedArticle ? 'Đọc báo nhanh' : 'Tin tức 24h'}
                    </h3>
                    {!selectedArticle && (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {updatedAt ? `Cập nhật: ${format(new Date(updatedAt), 'HH:mm dd/MM/yyyy')}` : 'Cập nhật bởi VnExpress'}
                        {isCached ? ' • Offline Cache' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {!selectedArticle && (
                     <button 
                       onClick={onRefresh}
                       className={cn("p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all", isRefreshing && "animate-spin")}
                     >
                       <RefreshCw className="w-5 h-5 text-gray-400" />
                     </button>
                   )}
                   <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <AnimatePresence initial={false} custom={direction}>
                {!selectedArticle ? (
                  /* LIST VIEW */
                  <motion.div 
                    key="news-list"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 space-y-8"
                  >
                    {articles.length > 0 ? articles.map((article, i) => (
                      <motion.div 
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group cursor-pointer"
                        onClick={() => handleArticleClick(article)}
                      >
                        {article.thumbnail && (
                          <div className="relative aspect-video rounded-3xl overflow-hidden mb-4 shadow-lg border border-gray-100 dark:border-gray-800">
                            <img 
                              src={article.thumbnail} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-4 left-4">
                               <span className="px-3 py-1 bg-traditional-red/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                 {article.category}
                               </span>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                             <Calendar className="w-3 h-3" />
                             <span>
                               {isValid(new Date(article.pubDate)) 
                                 ? format(new Date(article.pubDate), 'HH:mm • dd/MM/yyyy') 
                                 : 'Vừa xong'}
                             </span>
                          </div>
                          <h4 className="text-lg font-bold font-serif leading-snug group-hover:text-traditional-red transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-1.5 pt-2 text-traditional-red font-bold text-xs uppercase tracking-widest">
                             <span>Xem nhanh</span>
                             <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
                           <Newspaper className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">Đang cập nhật những tin tức mới nhất...</p>
                      </div>
                    )}
                    
                    {/* List Footer Spacer */}
                    <div className="h-20"></div>
                  </motion.div>
                ) : (
                  /* DETAIL VIEW (Reader Mode) */
                  <motion.div 
                    key="news-detail"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 overflow-y-auto custom-scrollbar p-0 flex flex-col"
                  >
                    {selectedArticle.thumbnail && (
                      <div className="w-full aspect-video relative">
                         <img 
                           src={selectedArticle.thumbnail} 
                           alt={selectedArticle.title} 
                           className="w-full h-full object-cover" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                         <div className="absolute bottom-6 left-6 right-6">
                            <span className="px-3 py-1 bg-traditional-gold text-traditional-red text-[9px] font-black uppercase tracking-[0.2em] rounded-md mb-3 inline-block">
                               {selectedArticle.category}
                            </span>
                            <h2 className="text-2xl font-bold font-serif text-white leading-tight drop-shadow-md">
                               {selectedArticle.title}
                            </h2>
                         </div>
                      </div>
                    )}
                    
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-traditional-red/10 flex items-center justify-center">
                               <Calendar className="w-5 h-5 text-traditional-red" />
                            </div>
                            <div className="leading-tight">
                               <p className="text-xs font-black uppercase text-gray-400 dark:text-gray-500">Ngày đăng</p>
                               <p className="text-sm font-bold">
                                 {isValid(new Date(selectedArticle.pubDate))
                                   ? format(new Date(selectedArticle.pubDate), 'HH:mm • dd MMMM yyyy', { locale: vi })
                                   : 'Thông tin đang cập nhật'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                           <p className="text-xs font-black uppercase text-gray-400 dark:text-gray-500">Tác giả</p>
                           <p className="text-sm font-bold">{selectedArticle.author || 'VnExpress'}</p>
                         </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                         <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                            {selectedArticle.description}
                         </p>
                      </div>
                      
                      {/* Note for full content */}
                      <div className="mt-10 p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
                         <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium italic">
                            Phần trên là nội dung tóm tắt của bài báo. Để xem toàn bộ bài viết chi tiết, hình ảnh và bình luận, mời bạn truy cập trực tiếp trang web của VnExpress.
                         </p>
                         <a 
                           href={selectedArticle.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-3 px-8 py-4 bg-traditional-red text-white rounded-2xl font-bold shadow-xl shadow-traditional-red/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                         >
                           <span>Đọc tiếp trên VnExpress</span>
                           <ExternalLink className="w-4 h-4" />
                         </a>
                      </div>
                    </div>
                    
                    {/* Detail Footer Spacer */}
                    <div className="h-20"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Global Footer (only visible in list mode) */}
            {!selectedArticle && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-center sticky bottom-0 border-t border-gray-100 dark:border-gray-800">
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] italic text-center">
                   Dữ liệu cung cấp bởi VnExpress RSS Feed
                 </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
