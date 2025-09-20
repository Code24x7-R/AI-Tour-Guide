import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = (text: string | null) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [volume, setVolume] = useState(1);
    
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stop = useCallback(() => {
        const synth = window.speechSynthesis;
        if (synth) {
            // cancel() is safe to call even if nothing is happening.
            // It clears the utterance queue and stops current speech.
            synth.cancel();
        }
        // Always reset our internal state when stopping. This is the key fix.
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    useEffect(() => {
        // If the text is cleared (e.g., on retake), ensure any ongoing speech is stopped.
        if (!text || !window.speechSynthesis) {
            stop();
            return;
        }

        // A new utterance is created for the new text.
        // The cleanup from the PREVIOUS render has already run `stop()`,
        // resetting state and cancelling any old speech.
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        const handleEnd = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.addEventListener('end', handleEnd);

        // The cleanup function is crucial. It runs when `text` changes or the component unmounts.
        return () => {
            utterance.removeEventListener('end', handleEnd);
            // We call our state-aware `stop` function to ensure the synth is cancelled
            // AND our component state (`isSpeaking`, `isPaused`) is correctly reset for the next run.
            stop();
        };
    }, [text, stop]);

    // This effect ensures that volume changes are applied immediately to the current utterance.
    useEffect(() => {
        if (utteranceRef.current) {
            utteranceRef.current.volume = volume;
        }
    }, [volume]);


    const speak = useCallback(() => {
        const utterance = utteranceRef.current;
        const synth = window.speechSynthesis;
        
        if (!utterance || !synth) return;

        // If speech was paused, resume it.
        if (synth.paused && isPaused) {
            synth.resume();
        } else {
            // Otherwise, speak the current utterance from the beginning.
            utterance.volume = volume;
            synth.speak(utterance);
        }
        
        setIsSpeaking(true);
        setIsPaused(false);

    }, [isPaused, volume]);

    const pause = useCallback(() => {
        const synth = window.speechSynthesis;
        if (synth && synth.speaking) {
            synth.pause();
            setIsSpeaking(false);
            setIsPaused(true);
        }
    }, []);

    return { speak, pause, stop, isSpeaking, isPaused, volume, setVolume };
};