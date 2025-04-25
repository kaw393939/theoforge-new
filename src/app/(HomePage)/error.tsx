'use client'; // Error components must be Client Components

import { useEffect } from 'react'; // Restore useEffect import

export default function Error({
  error, // Restore error prop
  reset,
}: {
  error: Error & { digest?: string }; // Restore error prop type
  reset: () => void;
}) {
  // Restore useEffect to log the error
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      {/* Keep rendering static string to avoid error.message issues */}
      <p>An error occurred. Please try again later.</p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
