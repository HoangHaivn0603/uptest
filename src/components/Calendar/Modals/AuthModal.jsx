import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, LogIn, UserPlus, Globe, MessageCircle } from 'lucide-react';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister,
  isLoading 
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'login') {
      const result = await onLogin(formData.email, formData.password);
      if (!result.success) setError(result.message);
      else onClose();
    } else {
      const result = await onRegister(formData.email, formData.name, formData.phone, formData.password);
      if (!result.success) setError(result.message);
      else onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="auth-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header / Tabs */}
            <div className="p-8 pb-0">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-3xl font-black font-serif text-traditional-red dark:text-traditional-gold">
                     {activeTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
                   </h3>
                   <p className="text-gray-400 text-sm font-medium mt-1">
                     {activeTab === 'login' ? 'Đăng nhập để đồng bộ lịch vạn niên của bạn' : 'Tham gia cộng đồng Lịch Việt ngay hôm nay'}
                   </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-8">
                <button 
                  onClick={() => setActiveTab('login')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === 'login' ? "bg-white dark:bg-gray-800 shadow-md text-traditional-red" : "text-gray-500"
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setActiveTab('register')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                    activeTab === 'register' ? "bg-white dark:bg-gray-800 shadow-md text-traditional-red" : "text-gray-500"
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {activeTab === 'register' && (
                    <>
                      <AuthInput 
                        icon={User}
                        label="Họ tên"
                        name="name"
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <AuthInput 
                        icon={Phone}
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </>
                  )}

                  <AuthInput 
                    icon={Mail}
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="relative">
                    <AuthInput 
                      icon={Lock}
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-3.5 text-gray-400 hover:text-traditional-red"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {error && (
                <p className="text-sm font-bold text-traditional-red mt-2 animate-bounce-slow text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-traditional-red text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-traditional-red/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? '🚀 Đăng nhập ngay' : '✨ Khởi tạo tài khoản'}</span>
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white dark:bg-gray-950 px-4">
                  Hoặc đăng nhập với
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-bold text-xs">
                    <Globe className="w-4 h-4 text-traditional-red" />
                    Google
                 </button>
                 <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Facebook
                 </button>
              </div>
            </form>

            <div className="p-8 pt-0 text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                 Bằng cách đăng nhập, bạn đồng ý với <span className="text-traditional-red cursor-pointer">Điều khoản dịch vụ</span> & <span className="text-traditional-red cursor-pointer">Chính sách bảo mật</span> của chúng tôi
               </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthInput({ icon: Icon, label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-traditional-red transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input 
          {...props}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-traditional-red/30 rounded-2xl outline-none transition-all font-bold text-sm text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  );
}
