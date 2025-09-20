import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';
import { RetryIcon } from './icons/RetryIcon';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ShareIcon } from './icons/ShareIcon';
import { LOADING_MESSAGES } from '../constants';
import ImageZoomModal from './ImageZoomModal';
import { ZoomInIcon } from './icons/ZoomInIcon';

interface ResultViewProps {
    image: string | null;
    description: string | null;
    isLoading: boolean;
    error: string | null;
    onRetake: () => void;
}

const formatDescription = (text: string): React.ReactNode => {
    return text.split('\n').map((line, index) => {
        if (line.trim() === '') return <br key={`br-${index}`} />;

        // Match **Label**: Content
        const headingMatch = line.match(/^\*\*(.*?)\*\*:\s*(.*)/);
        if (headingMatch) {
            const [, title, content] = headingMatch;
            const contentWithItalics = content.replace(/\*(.*?)\*/g, '<em>$1</em>');

            // Special, distinct styling for the Anecdote section
            if (title.toLowerCase() === 'anecdote') {
                return (
                    <div key={index} className="mt-5 p-4 bg-gray-700/50 rounded-lg border-l-4 border-yellow-500">
                         <h3 className="text-lg font-semibold text-yellow-400 mb-1">{title}</h3>
                         <p className="text-gray-300 italic" dangerouslySetInnerHTML={{ __html: contentWithItalics.replace(/\*([^*]+)\*/g, '$1') }} />
                    </div>
                );
            }

            // Standard styling for all other headings
            return (
                <div key={index} className="mb-4">
                    <h3 className="text-md font-semibold text-blue-400 uppercase tracking-wider">{title}</h3>
                    <p className="text-gray-200 mt-1 break-words" dangerouslySetInnerHTML={{ __html: contentWithItalics }} />
                </div>
            );
        }

        // For general paragraphs (e.g., description content spanning multiple lines)
        return (
             <p key={index} className="text-gray-300 mb-3 break-words" dangerouslySetInnerHTML={{ __html: line.replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        );
    });
};


const ResultView: React.FC<ResultViewProps> = ({ image, description, isLoading, error, onRetake }) => {
    const { speak, pause, stop, isSpeaking, volume, setVolume } = useSpeechSynthesis(description);
    const [shareStatus, setShareStatus] = useState('');
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);


    const handleRetakeClick = () => {
        stop();
        onRetake();
    };

    const handleShare = async () => {
        if (!description) return;

        const title = description.split('\n').find(line => line.toLowerCase().includes('title')) || 'AI Tour Guide Analysis';

        try {
            if (navigator.share) {
                await navigator.share({ title, text: description });
            } else {
                await navigator.clipboard.writeText(description);
                setShareStatus('Copied to clipboard!');
                setTimeout(() => setShareStatus(''), 2000);
            }
        } catch (err) {
            console.error("Share/Copy failed", err);
            setShareStatus('Failed to share.');
            setTimeout(() => setShareStatus(''), 2000);
        }
    };

    return (
        <>
        {isZoomModalOpen && image && (
            <ImageZoomModal imageSrc={image} onClose={() => setIsZoomModalOpen(false)} />
        )}
        <div className="w-full h-full max-w-2xl mx-auto flex flex-col p-4 pt-24 pb-8">
            <div className="relative w-full max-w-md mx-auto mb-4 group">
                {image && (
                    <button 
                        onClick={() => setIsZoomModalOpen(true)}
                        className="rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700 w-full block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                        aria-label="Zoom in on image"
                    >
                        <img src={image} alt="Captured artwork" className="w-full h-auto object-contain" />
                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ZoomInIcon className="w-12 h-12 text-white" />
                        </div>
                    </button>
                )}
                {description && (
                     <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4 p-2 bg-black/50 backdrop-blur-sm rounded-full">
                        {!isSpeaking ? (
                            <button onClick={speak} aria-label="Play narration" className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                                <PlayIcon className="w-7 h-7" />
                            </button>
                        ) : (
                            <button onClick={pause} aria-label="Pause narration" className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                                <PauseIcon className="w-7 h-7" />
                            </button>
                        )}
                        <button onClick={handleShare} aria-label="Share" className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                            <ShareIcon className="w-6 h-6" />
                        </button>
                        {shareStatus && <span className="absolute bottom-full mb-2 text-xs bg-gray-900 text-white px-2 py-1 rounded">{shareStatus}</span>}
                    </div>
                )}
            </div>
            
            <div className="relative flex-grow bg-gray-800 rounded-lg shadow-inner text-gray-200 w-full max-w-md mx-auto overflow-hidden">
                <div className="p-6 h-full overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-lg text-center transition-opacity duration-500">{loadingMessage}</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                            <p className="text-red-400 font-semibold text-lg">An Error Occurred</p>
                            <p className="text-sm mt-2 text-gray-400">{error}</p>
                        </div>
                    )}
                    {description && (
                        <div>
                            {formatDescription(description)}
                        </div>
                    )}
                </div>
                 {description && !isLoading && (
                    <div className="absolute top-4 right-0 bottom-4 w-8 flex items-center justify-center">
                         <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-32 h-2 appearance-none origin-center transform -rotate-90 bg-gray-600 rounded-full cursor-pointer"
                            aria-label="Volume control"
                        />
                    </div>
                )}
            </div>

            <div className="w-full max-w-md mx-auto mt-4 text-center">
                <button
                    onClick={handleRetakeClick}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                    <RetryIcon className="w-5 h-5" />
                    Take Another Photo
                </button>
            </div>
        </div>
        </>
    );
};

export default ResultView;