'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SubmitSelfAssessmentData } from '@/types/hr';
import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SCORE_LABELS } from '../constants';

interface SelfAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubmitSelfAssessmentData) => void;
  isLoading?: boolean;
  employeeName: string;
}

export function SelfAssessmentModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  employeeName,
}: SelfAssessmentModalProps) {
  const [selfScore, setSelfScore] = useState<number>(0);
  const [selfComments, setSelfComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [goals, setGoals] = useState('');

  const resetForm = useCallback(() => {
    setSelfScore(0);
    setSelfComments('');
    setStrengths('');
    setImprovements('');
    setGoals('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  const handleSubmit = useCallback(() => {
    if (selfScore < 1 || selfScore > 5) return;
    onSubmit({
      selfScore,
      selfComments: selfComments.trim() || undefined,
      strengths: strengths.trim() || undefined,
      improvements: improvements.trim() || undefined,
      goals: goals.trim() || undefined,
    });
    resetForm();
  }, [selfScore, selfComments, strengths, improvements, goals, onSubmit, resetForm]);

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Autoavaliação</DialogTitle>
          <DialogDescription>
            Preencha sua autoavaliação como funcionário: {employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Score selector */}
          <div className="space-y-2">
            <Label>Nota (1 a 5) *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setSelfScore(score)}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      score <= selfScore
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {SCORE_LABELS[score]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="self-comments">Comentários</Label>
            <Textarea
              id="self-comments"
              placeholder="Descreva sua avaliação geral..."
              value={selfComments}
              onChange={e => setSelfComments(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="self-strengths">Pontos fortes</Label>
            <Textarea
              id="self-strengths"
              placeholder="Quais são seus principais pontos fortes?"
              value={strengths}
              onChange={e => setStrengths(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="self-improvements">Pontos de melhoria</Label>
            <Textarea
              id="self-improvements"
              placeholder="Quais aspectos você gostaria de melhorar?"
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="self-goals">Metas e objetivos</Label>
            <Textarea
              id="self-goals"
              placeholder="Quais são suas metas para o próximo período?"
              value={goals}
              onChange={e => setGoals(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selfScore < 1 || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Autoavaliação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
