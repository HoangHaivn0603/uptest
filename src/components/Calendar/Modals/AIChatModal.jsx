import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Bot, User, Sparkles, Users, Smile, Heart, Star, Compass } from 'lucide-react';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';
import { useAIChat } from '../../../hooks/useAIChat';
import { useGroupChat } from '../../../hooks/useGroupChat';

// --- Assets ---

const STICKERS = [
  { char: '🧧', label: 'Lì xì' },
  { char: '🏮', label: 'Lồng đèn' },
  { char: '☯️', label: 'Âm dương' },
  { char: '🐉', label: 'Rồng' },
  { char: '🎋', label: 'Tre' },
  { char: '🌸', label: 'Hoa đào' },
  { char: '🌊', label: 'Sóng' },
  { char: '🐯', label: 'Hổ' },
  { char: '🎐', label: 'Chuông gió' },
  { char: '🪵', label: 'Củi' },
];

const EMOJIS = ['😊', '🙏', '🔥', '👏', '🙌', '✨', '🍀', '💰', '🌙', '☀️', '🎉', '🎊', '❤️', '👍', '👌'];

// --- Sub-components ---

/**
 * Tab-specific Header UI
 */
function ModalHeader({ activeTab, onTabChange, onClose }) {
  return (
    <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md z-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-traditional-red flex items-center justify-center shadow-lg shadow-traditional-red/20 rotate-3 transition-transform hover:rotate-0">
            {activeTab === 'ai' ? <Bot className="text-traditional-gold w-7 h-7" /> : <Users className="text-traditional-gold w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-xl font-black font-serif">
              {activeTab === 'ai' ? 'Trợ lý LichAssistant' : 'Cộng đồng LichViet'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {activeTab === 'ai' ? 'Đang trực tuyến' : '99+ đang online'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-all active:scale-95"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
        <button 
          onClick={() => onTabChange('ai')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
            activeTab === 'ai' ? "bg-white dark:bg-gray-800 shadow-sm text-traditional-red" : "text-gray-400"
          )}
        >
          <Bot className="w-4 h-4" />
          Trợ lý AI
        </button>
        <button 
          onClick={() => onTabChange('group')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
            activeTab === 'group' ? "bg-white dark:bg-gray-800 shadow-sm text-traditional-red" : "text-gray-400"
          )}
        >
          <Users className="w-4 h-4" />
          Cộng đồng
        </button>
      </div>
    </div>
  );
}

// --- Main Modal ---

export default function CommunicationModal({ 
  isOpen, 
  onClose, 
  appData,
  user
}) {
  const [activeTab, setActiveTab] = useState('ai');
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const aiChat = useAIChat(appData);
  const groupChat = useGroupChat(user, appData);
  
  const currentChat = activeTab === 'ai' ? aiChat : groupChat;
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setShowPicker(false);
  }, [currentChat.messages, currentChat.isTyping, activeTab]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    currentChat.sendMessage(inputValue);
    setInputValue('');
  };

  const handleStickerSend = (sticker) => {
    currentChat.sendMessage(sticker, 'sticker');
    setShowPicker(false);
  };

  const handleEmojiSend = (emoji) => {
    setInputValue(prev => prev + emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const aiQuickActions = [
    { label: 'Giá vàng hôm nay?', icon: '💰' },
    { label: 'Hôm nay ngày tốt không?', icon: '📅' },
    { label: 'Thời tiết hiện tại?', icon: '🌤️' },
  ];

  const groupQuickActions = [
    { label: 'Chào cả nhà!', icon: '👋' },
    { label: 'Nay chọn giờ nào đẹp các bác?', icon: '⏳' },
    { label: 'Chúc mọi người ngày mới hanh thông!', icon: '🍀' },
  ];

  const quickActions = activeTab === 'ai' ? aiQuickActions : groupQuickActions;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="comm-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[700px]"
          >
            <ModalHeader activeTab={activeTab} onTabChange={setActiveTab} onClose={onClose} />

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-gray-50/50 to-transparent dark:from-transparent relative"
            >
              {currentChat.messages.map((msg, i) => {
                const isSystem = msg.role === 'system';
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <p className="px-4 py-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">{msg.content}</p>
                    </div>
                  );
                }

                const isMe = msg.role === 'user';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-2.5",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-lg",
                      isMe ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                    )}>
                      {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-traditional-red" /> : msg.avatar || '👤'}
                    </div>
                    <div className={cn("max-w-[75%]", isMe ? "text-right" : "text-left")}>
                      {!isMe && msg.sender && (
                        <p className={cn("text-[10px] font-black uppercase tracking-wider mb-1 px-1", msg.color || "text-gray-400")}>
                          {msg.sender}
                        </p>
                      )}
                      
                      {msg.type === 'sticker' ? (
                        <div className="text-6xl animate-bounce-slow py-2">{msg.content}</div>
                      ) : (
                        <div className={cn(
                          "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                          isMe 
                            ? "bg-traditional-red text-white rounded-tr-none" 
                            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-tl-none font-medium text-left"
                        )}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {activeTab === 'ai' && aiChat.isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-traditional-red/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-traditional-red" />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl rounded-tl-none flex items-center gap-1.5 h-12">
                    <span className="w-1.5 h-1.5 bg-traditional-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-traditional-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-traditional-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel */}
            <div className="p-6 pt-0 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md relative">
              
              {/* Emoji/Sticker Picker Overlay */}
              <AnimatePresence>
                {showPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full left-6 right-6 mb-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-20"
                  >
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nhãn dán (Stickers)</p>
                      <div className="grid grid-cols-5 gap-3">
                        {STICKERS.map((s, i) => (
                          <button 
                            key={i}
                            onClick={() => handleStickerSend(s.char)}
                            className="text-3xl hover:scale-125 transition-transform active:scale-95 text-center"
                            title={s.label}
                          >
                            {s.char}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Biểu cảm (Emojis)</p>
                      <div className="flex flex-wrap gap-2.5">
                        {EMOJIS.map((e, i) => (
                          <button 
                            key={i}
                            onClick={() => handleEmojiSend(e)}
                            className="text-xl hover:scale-125 transition-transform active:scale-95"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => currentChat.sendMessage(action.label)}
                    className="whitespace-nowrap px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-traditional-red/10 dark:hover:bg-traditional-red/5 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 hover:text-traditional-red transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Row */}
              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => setShowPicker(!showPicker)}
                  className={cn(
                    "p-4 rounded-full transition-all active:scale-90 shrink-0",
                    showPicker ? "bg-traditional-red text-white" : "bg-gray-100 dark:bg-gray-900 text-gray-400 hover:text-traditional-red"
                  )}
                >
                  <Smile className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                   <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={activeTab === 'ai' ? "Gửi lời nhắn đến Trợ lý..." : "Gửi lời nhắn vào cộng đồng..."}
                    className="w-full pl-6 pr-14 py-5 bg-gray-100 dark:bg-gray-900 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-traditional-red/20 outline-none transition-all placeholder:text-gray-400"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={cn(
                      "absolute right-2.5 top-2.5 p-3 rounded-2xl transition-all shadow-lg active:scale-95",
                      inputValue.trim() 
                        ? "bg-traditional-red text-white shadow-traditional-red/20 cursor-pointer" 
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 opacity-50">
                <Sparkles className="w-3 h-3 text-traditional-gold" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{activeTab === 'ai' ? "Premium Assistant" : "LichViet Community"}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 
 * Floating Action Button for Chat 
 */
export function ChatFAB({ onClick }) {
  return (
    <motion.button 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 3 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 sm:bottom-10 sm:right-10 z-[90] w-16 h-16 rounded-[1.5rem] bg-traditional-red text-white flex items-center justify-center shadow-2xl shadow-traditional-red/30 cursor-pointer group"
    >
      <div className="absolute inset-0 rounded-[1.5rem] bg-traditional-red animate-ping opacity-20 group-hover:hidden"></div>
      <MessageSquare className="w-7 h-7" />
    </motion.button>
  );
}
