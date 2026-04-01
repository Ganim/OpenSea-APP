'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  CompleteInterviewData,
  InterviewRecommendation,
} from '@/types/hr';
import { Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { INTERVIEW_RECOMMENDATION_LABELS } from '../constants';

interface CompleteInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CompleteInterviewData) => Promise<void>;
}

export function CompleteInterviewModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: CompleteInterviewModalProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [recommendation, setRecommendation] = useState('');

  const resetForm = () => {
    setFeedback('');
    setRating(0);
    setRecommendation('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid =
    feedback.trim().length > 0 && rating > 0 && recommendation.length > 0;

  const handleSubmit = async () => {
    await onSubmit({
      feedback: feedback.trim(),
      rating,
      recommendation: recommendation as InterviewRecommendation,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Concluir Entrevista</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="iv-feedback">Feedback *</Label>
            <Textarea
              id="iv-feedback"
              placeholder="Descreva sua avaliação do candidato..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Avaliação (1-5) *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      n <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recomendação *</Label>
            <Select value={recommendation} onValueChange={setRecommendation}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTERVIEW_RECOMMENDATION_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Concluir'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
