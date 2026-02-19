'use client';

import { useState, useEffect, useCallback } from 'react';

export default function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [support, setSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setSupport(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!support) {
        alert("Voice search is not supported in this browser.");
        return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }, [support]);

  return { isListening, transcript, startListening, support };
}
