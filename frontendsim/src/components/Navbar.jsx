import React from "react";
import { Link, useLocation } from "react-router-dom";

// Animation keyframes - glow effect
const glowPulse = `
@keyframes glowPulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
.pulse-effect {
  animation: glowPulse 0.5s ease-in-out;
}
`;

// Tubelight fadeout animation
const fadeTubelight = `
@keyframes fadeTubelight {
  0% { opacity: 1; }
  30% { opacity: 0.7; }
  60% { opacity: 0.3; }
  100% { opacity: 0; }
}
`;

function Navbar() {
  const location = useLocation();
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "No Protection", path: "/no-protection" },
    { name: "DDOS Protection", path: "/ddos-protection" },
  ];

  return (
    <>
      <style>{glowPulse}</style>
      <style>{fadeTubelight}</style>
      <nav className="z-50 fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Branding / Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
                DDoS Sim
              </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 flex justify-center">
              <div className="hidden sm:block">
                <div className="flex space-x-12 text-amber-50">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`group relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-110 ${isActive ? "text-purple-400" : ""}`}
                      >
                        {/* Top line animation */}
                        <span className="absolute -top-1 left-0 w-full h-0.5 bg-purple-500 transform scale-x-0 origin-center transition-transform duration-200 ease-out group-hover:scale-x-100"></span>

                        {/* Glow layers */}
                        <span className="absolute -top-1 left-0 w-full h-4 bg-gradient-to-t from-purple-400/90 to-transparent blur-md transform scale-x-0 origin-center transition-transform duration-300 ease-out delay-200 group-hover:scale-x-100 group-hover:skew-y-3"></span>
                        <span className="absolute -top-2 left-0 w-full h-6 bg-gradient-to-t from-purple-400/70 to-transparent blur-xl transform scale-x-0 origin-center transition-transform duration-300 ease-out delay-200 group-hover:scale-x-100 group-hover:skew-y-6"></span>
                        <span className="absolute -top-3 left-0 w-full h-8 bg-gradient-to-t from-purple-400/50 to-transparent blur-2xl transform scale-x-0 origin-center transition-transform duration-300 ease-out delay-200 group-hover:scale-x-100 group-hover:skew-y-12"></span>

                        {/* Link label */}
                        <span className="relative z-10 text-white/90 group-hover:text-white transition-colors duration-300">
                          {link.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex-shrink-0">
              <Link
                to="/login"
                className="text-sm font-medium text-white/80 hover:text-purple-400 transition-colors duration-200"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
