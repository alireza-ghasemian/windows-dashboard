import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b081e] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#141031] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h1 className="text-lg font-bold">خطا در اجرای برنامه</h1>
                <p className="text-xs text-slate-400">An unexpected error occurred</p>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs text-rose-300 max-h-48 overflow-auto break-all">
              {this.state.error?.toString() || "Unknown rendering error"}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all text-xs"
              >
                تلاش مجدد / Refresh App
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full h-11 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold transition-all text-[11px]"
              >
                پاک‌سازی داده‌ها و راه‌اندازی مجدد (در صورت تداوم خطا)
              </button>
              <p className="text-[10px] text-center text-slate-500">
                توجه: دکمه پاک‌سازی داده‌ها تمام تنظیمات ذخیره شده محلی را بازنشانی می‌کند.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
