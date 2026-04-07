import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      let errorDetails = null;

      try {
        // Try to parse as FirestoreErrorInfo
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.operationType) {
          errorMessage = parsed.error;
          errorDetails = parsed;
        }
      } catch (e) {
        // Not JSON, use as is
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-xl ambient-shadow border border-error/20">
            <div className="flex items-center gap-4 mb-6 text-error">
              <AlertTriangle size={32} />
              <h1 className="text-xl font-bold font-headline">Application Error</h1>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              {errorMessage}
            </p>
            {errorDetails && (
              <div className="bg-surface-container p-4 rounded-lg text-xs font-mono text-on-surface-variant overflow-auto max-h-48">
                <p><strong>Operation:</strong> {errorDetails.operationType}</p>
                <p><strong>Path:</strong> {errorDetails.path}</p>
                {errorDetails.authInfo && (
                  <p><strong>User ID:</strong> {errorDetails.authInfo.userId || 'Unauthenticated'}</p>
                )}
              </div>
            )}
            <button
              className="mt-6 w-full primary-gradient text-white py-3 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
