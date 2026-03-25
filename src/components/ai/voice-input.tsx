'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

// Extend window for WebKit Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function VoiceInput({ onTranscription, disabled }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      toast.error('Reconhecimento de voz nao suportado neste navegador.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setIsListening(false);
          setInterimText('');
          onTranscription(finalTranscript.trim());
          recognitionRef.current = null;
        } else {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          toast.error(
            'Acesso ao microfone negado. Verifique as permissoes do navegador.'
          );
        } else if (event.error === 'no-speech') {
          toast.info('Nenhuma fala detectada. Tente novamente.');
        } else if (event.error !== 'aborted') {
          toast.error('Erro no reconhecimento de voz. Tente novamente.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      toast.error('Nao foi possivel iniciar o reconhecimento de voz.');
    }
  }, [onTranscription]);

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!isSupported) return null;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 shrink-0 transition-all duration-200',
          isListening
            ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 animate-pulse'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={handleToggle}
        disabled={disabled}
        title={isListening ? 'Parar gravacao' : 'Entrada por voz'}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Interim text tooltip */}
      {isListening && interimText && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[240px] truncate bg-popover border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground shadow-md">
          {interimText}
        </div>
      )}
    </div>
  );
}
