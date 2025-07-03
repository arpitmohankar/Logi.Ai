import dynamic from 'next/dynamic';
import LoadingSpinner from './LoadingSpinner';

// Dynamically import the Map component with no SSR
const Map = dynamic(
  () => import('./Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <LoadingSpinner size="large" />
      </div>
    )
  }
);

export default Map;
