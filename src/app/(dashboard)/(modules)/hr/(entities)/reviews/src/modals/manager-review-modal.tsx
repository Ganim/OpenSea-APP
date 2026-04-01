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
import type { SubmitManagerReviewData } from '@/types/hr';
import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SCORE_LABELS } from '../constants';

interface ManagerReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubmitManagerReviewData) => void;
  isLoading?: boolean;
  employeeName: string;
  selfScore?: number | null;
}

export function ManagerReviewModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  employeeName,
  selfScore,
}: ManagerReviewModalProps) {
  const [managerScore, setManagerScore] = useState<number>(0);
  const [managerComments, setManagerComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [goals, setGoals] = useState('');

  const resetForm = useCallback(() => {
    setManagerScore(0);
    setManagerComments('');
    setStrengths('');
    setImprovements('');
    setGoals('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange]);

  const handleSubmit = useCallback(() => {
    if (managerScore < 1 || managerScore > 5) return;
    onSubmit({
      managerScore,
      managerComments: managerComments.trim() || undefined,
      strengths: strengths.trim() || undefined,
      improvements: improvements.trim() || undefined,
      goals: goals.trim() || undefined,
    });
    resetForm();
  }, [managerScore, managerComments, strengths, improvements, goals, onSubmit, resetForm]);

  return (
    <Dialog open={open} onOpenChange={val => !val && handleClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliação do Gestor</DialogTitle>
          <DialogDescription>
            Avalie o desempenho de: {employeeName}
            {selfScore != null && (
              <span className="block mt-1 text-xs">
                Autoavaliação do funcionário: {selfScore.toFixed(1)} -{' '}
                {SCORE_LABELS[Math.round(selfScore)] ?? ''}
              </span>
            )}
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
                  onClick={() => setManagerScore(score)}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      score <= managerScore
                        ? 'fill-violet-400 text-violet-400'
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
            <Label htmlFor="mgr-comments">Comentários</Label>
            <Textarea
              id="mgr-comments"
              placeholder="Descreva sua avaliação sobre o funcionário..."
              value={managerComments}
              onChange={e => setManagerComments(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="mgr-strengths">Pontos fortes</Label>
            <Textarea
              id="mgr-strengths"
              placeholder="Principais pontos fortes do funcionário..."
              value={strengths}
              onChange={e => setStrengths(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="mgr-improvements">Pontos de melhoria</Label>
            <Textarea
              id="mgr-improvements"
              placeholder="Aspectos que o funcionário pode melhorar..."
              value={improvements}
              onChange={e => setImprovements(e.target.value)}
              rows={2}
              maxLength={2000}
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="mgr-goals">Metas e objetivos</Label>
            <Textarea
              id="mgr-goals"
              placeholder="Metas sugeridas para o próximo período..."
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
            disabled={managerScore < 1 || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
