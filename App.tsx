import React from 'react';
import { Experience } from './components/Experience';
import { useTreeStore } from './store';

const App: React.FC = () => {
  const { mode, toggleMode } = useTreeStore();

  return (
    <div className="relative w-full h-screen bg-[#1a0510] text-white">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header / Brand */}
        <header className="flex flex-col items-start space-y-2 pointer-events-auto">
          <h1 className="text-5xl md:text-7xl font-signature tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-pink-300 drop-shadow-[0_0_15px_rgba(255,192,203,0.6)]">
            Arix Signature
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-pink-200/80 font-sans ml-1">
            The Interactive Christmas Experience
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col items-center pointer-events-auto w-full md:w-auto md:self-center">
            <button
                onClick={toggleMode}
                className={`
                    group relative px-8 py-4 rounded-full 
                    transition-all duration-500 ease-out
                    border border-pink-500/30 backdrop-blur-md
                    ${mode === 'SCATTERED' ? 'bg-pink-900/40' : 'bg-white/10'}
                    hover:bg-pink-500/20 hover:scale-105 hover:border-pink-400
                    overflow-hidden
                `}
            >
                {/* Button Glow Effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-400/30 via-transparent to-transparent blur-md"></div>
                
                <span className="relative z-10 font-sans font-semibold text-lg md:text-xl text-pink-100 tracking-[0.2em] uppercase">
                    {mode === 'TREE_SHAPE' ? 'Scatter Magic' : 'Gather Spirit'}
                </span>
            </button>
            
            <p className="mt-4 text-pink-300/50 text-[10px] uppercase tracking-widest font-sans">
                Interactive WebGL • React 19 • Three.js
            </p>
        </div>
      </div>
    </div>
  );
};

export default App;