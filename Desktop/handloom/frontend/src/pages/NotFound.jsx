import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-handloom-cream flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-primary-200 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary px-8 py-3">Back to Home</Link>
    </div>
  );
}
