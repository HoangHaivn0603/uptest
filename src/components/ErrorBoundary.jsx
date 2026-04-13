import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * React Error Boundary to catch render errors gracefully.
 * Displays a fallback UI instead of a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
          <div className="text-center max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-serif text-gray-800 dark:text-white mb-2">
                Đã xảy ra lỗi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang để tiếp tục sử dụng.
              </p>
            </div>
            <button 
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-8 py-4 bg-traditional-red text-white rounded-2xl font-bold shadow-xl shadow-traditional-red/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại trang
            </button>
            {this.state.error && (
              <details className="text-left p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
                <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Chi tiết lỗi</summary>
                <pre className="mt-2 text-[10px] text-red-500 overflow-auto whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
