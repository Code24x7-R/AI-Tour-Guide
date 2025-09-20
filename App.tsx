import React, { useState, useCallback, useEffect } from 'react';
import CameraView from './components/CameraView';
import ResultView from './components/ResultView';
import HistorySidebar from './components/HistorySidebar';
import { getArtDescription } from './services/geminiService';
import { getHistory, addToHistory, updateHistoryItem, HistoryItem } from './services/storageService';
import { resizeImage } from './utils/image';
import { HistoryIcon } from './components/icons/HistoryIcon';
import WelcomeView from './components/WelcomeView';

type AppState = 'welcome' | 'camera' | 'loading' | 'result' | 'error';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('welcome');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleCapture = useCallback(async (imageDataUrl: string) => {
        setAppState('loading');
        setError(null);
        setDescription(null);
        let displayImageUrl: string | null = null;
        
        try {
            displayImageUrl = await resizeImage(imageDataUrl, 1024, 1024);
            setCapturedImage(displayImageUrl);
            
            const result = await getArtDescription(displayImageUrl);
            setDescription(result);
            setAppState('result');
            
            const newHistory = addToHistory({ 
                imageDataUrl: displayImageUrl, 
                description: result 
            });
            setHistory(newHistory);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            
            if (displayImageUrl) {
                const newHistory = addToHistory({
                    imageDataUrl: displayImageUrl,
                    description: null
                });
                setHistory(newHistory);
            }
            setError(`Failed to analyze the image. ${errorMessage}. The photo has been saved to your history. You can try analyzing it again from there.`);
            setAppState('error');
        }
    }, []);

    const handleRetake = () => {
        setAppState('camera');
        setCapturedImage(null);
        setDescription(null);
        setError(null);
    };

    const handleSelectHistoryItem = useCallback(async (item: HistoryItem) => {
        setIsHistoryVisible(false);

        if (item.description === null) {
            // This is a retry attempt
            setAppState('loading');
            setCapturedImage(item.imageDataUrl);
            setDescription(null);
            setError(null);

            try {
                const result = await getArtDescription(item.imageDataUrl);
                setDescription(result);
                // Update the item in storage and state
                const updatedHistory = updateHistoryItem(item.id, result);
                setHistory(updatedHistory);
                setAppState('result');
            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to analyze the image. ${errorMessage}`);
                setAppState('error');
            }
        } else {
            // Regular history view
            setCapturedImage(item.imageDataUrl);
            setDescription(item.description);
            setError(null);
            setAppState('result');
        }
    }, []);
    
    const handleStartCamera = () => {
        setAppState('camera');
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-900 flex flex-col items-center justify-center font-sans">
             <HistorySidebar
                isVisible={isHistoryVisible}
                history={history}
                onSelect={handleSelectHistoryItem}
                onClose={() => setIsHistoryVisible(false)}
            />
            <header className="absolute top-0 left-0 w-full p-4 bg-gray-900 bg-opacity-50 z-20 flex justify-between items-center">
                <button onClick={() => setIsHistoryVisible(true)} className="p-2 rounded-full hover:bg-gray-700" aria-label="View history">
                    <HistoryIcon className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-2xl font-bold tracking-wider text-white">AI Tour Guide</h1>
                <div className="w-9 h-9"></div>
            </header>
            
            <main className="w-full h-full flex items-center justify-center">
                {appState === 'welcome' && <WelcomeView onStart={handleStartCamera} />}
                {appState === 'camera' && <CameraView onCapture={handleCapture} />}
                {(appState === 'loading' || appState === 'result' || appState === 'error') && (
                    <ResultView
                        image={capturedImage}
                        description={description}
                        isLoading={appState === 'loading'}
                        error={error}
                        onRetake={handleRetake}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
