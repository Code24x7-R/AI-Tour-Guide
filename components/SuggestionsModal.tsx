import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { Spinner } from './Spinner';

interface SuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
    isLoading: boolean;
    error: string | null;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions, isLoading, error }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white"
                    onClick={onClose}
                    aria-label="Close suggestions"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <h2 className="text-xl font-bold text-white mb-4">Nearby Suggestions</h2>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <p className="mt-4 text-gray-300">Finding points of interest...</p>
                    </div>
                )}
                
                {error && (
                    <div className="text-center h-48 flex flex-col justify-center items-center">
                        <p className="text-red-400 font-semibold">Could not fetch suggestions</p>
                        <p className="text-sm mt-2 text-gray-400">{error}</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <div>
                        {suggestions.length > 0 ? (
                            <>
                                <p className="text-gray-400 mb-4 text-sm">Here are some interesting things you could look for nearby:</p>
                                <ul className="space-y-3">
                                    {suggestions.map((item, index) => (
                                        <li key={index} className="bg-gray-700 p-3 rounded-md text-white transition-colors">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p className="text-gray-400 text-center h-48 flex items-center justify-center">No notable points of interest were found nearby.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestionsModal;
