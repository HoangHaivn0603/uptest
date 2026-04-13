import Calendar from './components/Calendar'
import ErrorBoundary from './components/ErrorBoundary'
import ToastContainer from './components/Toast'
import { useToast, ToastContext } from './hooks/useToast'

function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ErrorBoundary>
      <ToastContext.Provider value={{ addToast, removeToast }}>
        <div className="bg-viet-cream dark:bg-viet-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
          <Calendar />
          
          {/* Mobile Navigation / Bottom Bar */}
          <nav className="fixed bottom-0 left-0 right-0 glass border-t border-t-white/20 px-6 py-3 flex justify-around items-center z-50 md:hidden pb-safe">
            <div className="flex flex-col items-center gap-1 text-traditional-red">
              <div className="p-2 bg-traditional-red/10 rounded-xl">
                 <i className="lucide-calendar h-6 w-6"></i>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Lịch</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <div className="p-2">
                 <i className="lucide-settings h-6 w-6"></i>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Cài đặt</span>
            </div>
          </nav>
        </div>
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </ToastContext.Provider>
    </ErrorBoundary>
  )
}

export default App
