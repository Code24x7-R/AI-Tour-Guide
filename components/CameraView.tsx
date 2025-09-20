
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { CompassIcon } from './icons/CompassIcon';
import SuggestionsModal from './SuggestionsModal';
import { getNearbySuggestions } from '../services/geminiService';


interface CameraViewProps {
    onCapture: (imageDataUrl: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    // new states for suggestions
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                activeStream = mediaStream;
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access the camera. Please check permissions.");
            }
        };

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCaptureClick = useCallback(() => {
        if (videoRef.current && canvasRef.current && stream) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context) {
                // Set canvas dimensions to match video to avoid distortion
                const track = stream.getVideoTracks()[0];
                const settings = track.getSettings();
                canvas.width = settings.width || video.videoWidth;
                canvas.height = settings.height || video.videoHeight;

                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCapture(imageDataUrl);
            }
        }
    }, [onCapture, stream]);

    const handleSuggestionsClick = useCallback(async () => {
        setIsSuggestionsModalOpen(true);
        setSuggestionsLoading(true);
        setSuggestionsError(null);
        setSuggestions([]);

        if (!navigator.geolocation) {
            setSuggestionsError("Geolocation is not supported by your browser.");
            setSuggestionsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const nearbyPlaces = await getNearbySuggestions(latitude, longitude);
                    setSuggestions(nearbyPlaces);
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                    setSuggestionsError(message);
                } finally {
                    setSuggestionsLoading(false);
                }
            },
            (error) => {
                let message = "An unknown error occurred while getting your location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "You denied the request for Geolocation. Please enable location permissions in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get user location timed out.";
                        break;
                }
                setSuggestionsError(message);
                setSuggestionsLoading(false);
            }
        );
    }, []);

    if (error) {
        return <div className="text-red-400 p-4">{error}</div>;
    }

    return (
        <div className="relative w-full h-full bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            <div className="absolute top-24 right-4 z-10">
                 <button
                    onClick={handleSuggestionsClick}
                    className="p-3 rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                    aria-label="Get nearby suggestions"
                >
                    <CompassIcon className="w-7 h-7" />
                </button>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full flex justify-center p-8 bg-gradient-to-t from-black/50 to-transparent">
                <button
                    onClick={handleCaptureClick}
                    className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                    aria-label="Take Photo"
                >
                    <CameraIcon className="w-10 h-10 text-white" />
                </button>
            </div>

            <SuggestionsModal 
                isOpen={isSuggestionsModalOpen}
                onClose={() => setIsSuggestionsModalOpen(false)}
                suggestions={suggestions}
                isLoading={suggestionsLoading}
                error={suggestionsError}
            />
        </div>
    );
};

export default CameraView;