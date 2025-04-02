"use client"

export function LoadingSpinner({ size = "medium" }) {
  const sizeClass = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-samudra-600 ${sizeClass[size]}`}
      ></div>
    </div>
  );
}