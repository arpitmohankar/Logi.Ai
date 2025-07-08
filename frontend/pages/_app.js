import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../providers/AuthProvider';
import { SocketProvider } from '../providers/SocketProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import ErrorBoundary from '../components/common/ErrorBoundary';
import '../styles/globals.css';
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.08,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
