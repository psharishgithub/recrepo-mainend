export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-600 border-t-white"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-stone-950"></div>
        </div>
      </div>
    </div>
  );
}

