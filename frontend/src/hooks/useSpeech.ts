import { useCallback } from 'react';

/**
 * Custom hook to handle Web Speech API (speechSynthesis)
 */
export const useSpeech = () => {
    
    /**
     * Formats text for clearer reading (e.g., "ABC123" -> "A B C 1 2 3")
     * This ensures the voice reads individual characters instead of trying to pronounce words.
     */
    const formatTextForSpeech = (text: string): string => {
        if (!text) return "";
        return text.split('').join(' ');
    };

    /**
     * Reads the provided text aloud using the browser's native Speech Synthesis
     */
    const leerEnVozAlta = useCallback((texto: string) => {
        if (!('speechSynthesis' in window)) {
            console.warn("Web Speech API no es compatible con este navegador.");
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(texto);
        
        // Try to find a Spanish voice (es-ES or es-CO)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === 'es-ES' || v.lang === 'es-CO') || voices.find(v => v.lang.startsWith('es'));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    }, []);

    return {
        leerEnVozAlta,
        formatTextForSpeech
    };
};
