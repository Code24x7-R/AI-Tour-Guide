import React from 'react';
import { HistoryItem } from '../services/storageService';
import { CloseIcon } from './icons/CloseIcon';
import { AnalyzeIcon } from './icons/AnalyzeIcon';

interface HistorySidebarProps {
    isVisible: boolean;
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isVisible, history, onSelect, onClose }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 left-0 h-full w-full max-w-xs bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close history">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                {history.length === 0 ? (
                    <p className="text-gray-400 p-4 text-center">Your captured items will appear here.</p>
                ) : (
                    <div className="p-2 grid grid-cols-3 gap-2 overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
                        {[...history].reverse().map(item => (
                            <button key={item.id} onClick={() => onSelect(item)} className="relative aspect-square bg-gray-800 rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-105">
                                <img src={item.imageDataUrl} alt="History thumbnail" className="w-full h-full object-cover" />
                                {item.description === null && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center" aria-label="Analysis pending, click to retry">
                                        <AnalyzeIcon className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
export default HistorySidebar;
