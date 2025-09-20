import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ImageZoomModalProps {
    imageSrc: string;
    onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageSrc, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed image view"
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
            
            <button
                className="absolute top-4 right-4 p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-700 z-10"
                onClick={onClose}
                aria-label="Close zoom view"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
            
            <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                <img 
                    src={imageSrc} 
                    alt="Zoomed captured artwork" 
                    className="object-contain max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
};

export default ImageZoomModal;
