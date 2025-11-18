import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-200 flex items-center justify-center p-4">
          <GlassCard className="max-w-2xl w-full p-8">
            <div className="text-center">
              <Icon name="help" className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-[0_0_20px_rgba(72,187,255,0.5)] transition-all"
              >
                Reload Application
              </button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}