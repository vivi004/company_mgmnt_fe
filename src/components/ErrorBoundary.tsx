import React from 'react';

interface State {
    hasError: boolean;
    error?: Error;
}

interface Props {
    children: React.ReactNode;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary caught a render error:', error, info.componentStack);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center font-['Outfit'] p-6">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-white mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-slate-400 font-medium mb-8">
                            An unexpected error occurred. Please reload the page.
                        </p>
                        {this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest"
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

export default ErrorBoundary;
