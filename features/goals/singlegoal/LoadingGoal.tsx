const LoadingGoal = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-slate-600 text-lg">Loading goal details...</p>
    </div>
  </div>
);

export default LoadingGoal;
