const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="relative mb-12 h-64 w-full flex items-center justify-center">
          {/* Background decorative glows */}
          <div className="absolute w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-700"></div>

          {/* Floating Chat Bubble 1 (Sent) */}
          <div className="absolute top-4 right-8 w-48 bg-primary rounded-2xl rounded-tr-none p-4 shadow-xl transform translate-y-2 animate-bounce" style={{ animationDuration: "3s" }}>
            <div className="flex gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-content/20 flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-primary-content/30 rounded w-full"></div>
                <div className="h-2 bg-primary-content/30 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Floating Chat Bubble 2 (Received) */}
          <div className="absolute bottom-4 left-8 w-56 bg-base-100 rounded-2xl rounded-tl-none p-4 shadow-2xl transform -translate-y-2 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
            <div className="flex gap-3 mb-2">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-base-300 rounded w-full"></div>
                <div className="h-2 bg-base-300 rounded w-5/6"></div>
                <div className="h-2 bg-base-300 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0"></div>
            </div>
          </div>

          {/* Central Notification Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-secondary text-secondary-content rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern