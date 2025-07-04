import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            We are sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <Button onClick={this.handleReset}>
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 border rounded max-w-2xl">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
