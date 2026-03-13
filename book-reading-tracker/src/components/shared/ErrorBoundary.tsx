// src/components/shared/ErrorBoundary.tsx
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
              {this.state.error.message}
            </p>
            <pre className="text-xs text-left bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mb-6 overflow-auto max-h-32 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar la app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
