import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  parseVoiceCommand,
  VoiceCommandResult,
  ISpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from '../services/voiceSearch';

export interface UseVoiceSearchOptions {
  onCommand?: (result: VoiceCommandResult) => void;
  onError?: (errorMessage: string) => void;
  lang?: string;
}

export interface UseVoiceSearchResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetError: () => void;
}

export function useVoiceSearch({
  onCommand,
  onError,
  lang,
}: UseVoiceSearchOptions = {}): UseVoiceSearchResult {
  const [isSupported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onCommandRef = useRef(onCommand);
  const onErrorRef = useRef(onError);

  // Keep callback refs fresh
  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Speech recognition is not supported in this browser.';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    // If currently listening, toggle off
    if (isListeningRef.current) {
      stopListening();
      return;
    }

    // Clean up previous instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    const recognition = createSpeechRecognition();
    if (!recognition) {
      const msg = 'Unable to initialize Web Speech API.';
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    if (lang) {
      recognition.lang = lang;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const resultItem = event.results[i];
        if (resultItem.isFinal) {
          finalStr += resultItem[0]?.transcript || '';
        } else {
          interimStr += resultItem[0]?.transcript || '';
        }
      }

      if (interimStr) {
        setInterimTranscript(interimStr);
      }

      if (finalStr) {
        const trimmed = finalStr.trim();
        setTranscript(trimmed);
        setInterimTranscript('');

        // Parse command and execute callback
        const commandResult = parseVoiceCommand(trimmed);
        onCommandRef.current?.(commandResult);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let userMsg = 'An error occurred during voice recognition.';

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          userMsg =
            'Microphone access denied. Please allow microphone permissions in your browser.';
          break;
        case 'no-speech':
          userMsg = 'No speech detected. Please speak into your microphone and try again.';
          break;
        case 'audio-capture':
          userMsg = 'No microphone was found. Please ensure a microphone is connected.';
          break;
        case 'network':
          userMsg = 'Network error while contacting speech recognition service.';
          break;
        case 'aborted':
          // User or system stopped intentionally; do not show scary error
          isListeningRef.current = false;
          setIsListening(false);
          return;
        default:
          userMsg = event.message || `Speech error: ${event.error}`;
          break;
      }

      setError(userMsg);
      onErrorRef.current?.(userMsg);
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to start microphone recording.';
      setError(errorMsg);
      onErrorRef.current?.(errorMsg);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [isSupported, lang, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetError,
  };
}
