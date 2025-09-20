import React from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface WelcomeViewProps {
    onStart: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-white animate-fade-in">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="mb-6">
                 <svg className="w-24 h-24 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">AI Tour Guide</h1>
            <p className="text-lg text-gray-300 mb-10 max-w-md">
                Discover the stories behind artworks and monuments. Just point your camera and tap.
            </p>
            <button
                onClick={onStart}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg transition-all duration-200 ease-in-out hover:bg-blue-700 hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 shadow-lg shadow-blue-500/20"
                aria-label="Start Camera"
            >
                <CameraIcon className="w-7 h-7" />
                <span>Start Exploring</span>
            </button>
        </div>
    );
};

export default WelcomeView;