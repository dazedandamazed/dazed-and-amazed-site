export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/largelogo.svg"
      alt="Dazed and Amazed"
      className={`block h-auto max-w-full object-contain transition-[width] duration-300 ${className}`}
    />
  );
}
