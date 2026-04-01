'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PerformanceReview, PerformanceReviewStatus } from '@/types/hr';
import {
  CheckCircle,
  ClipboardCheck,
  MessageSquare,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  User,
} from 'lucide-react';
import {
  PERFORMANCE_REVIEW_STATUS_COLORS,
  PERFORMANCE_REVIEW_STATUS_LABELS,
  SCORE_LABELS,
} from '../constants';

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: PerformanceReview | null;
  employeeName: string;
  reviewerName: string;
  onSubmitSelfAssessment?: () => void;
  onSubmitManagerReview?: () => void;
  onAcknowledge?: () => void;
  canModify: boolean;
}

export function ReviewDetailModal({
  open,
  onOpenChange,
  review,
  employeeName,
  reviewerName,
  onSubmitSelfAssessment,
  onSubmitManagerReview,
  onAcknowledge,
  canModify,
}: ReviewDetailModalProps) {
  if (!review) return null;

  const statusColors =
    PERFORMANCE_REVIEW_STATUS_COLORS[review.status as PerformanceReviewStatus];
  const statusLabel =
    PERFORMANCE_REVIEW_STATUS_LABELS[review.status as PerformanceReviewStatus] ??
    review.status;

  const renderScore = (score: number | null, label: string) => {
    if (score === null) return null;
    return (
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium">
          {score.toFixed(1)} - {SCORE_LABELS[Math.round(score)] ?? ''}
        </span>
        <span className="text-xs text-muted-foreground">({label})</span>
      </div>
    );
  };

  const renderTextSection = (
    icon: React.ReactNode,
    title: string,
    content: string | null
  ) => {
    if (!content) return null;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    );
  };

  const showSelfAssessmentAction =
    canModify &&
    (review.status === 'PENDING' || review.status === 'SELF_ASSESSMENT') &&
    onSubmitSelfAssessment;

  const showManagerReviewAction =
    canModify &&
    review.status === 'MANAGER_REVIEW' &&
    onSubmitManagerReview;

  const showAcknowledgeAction =
    canModify &&
    review.status === 'COMPLETED' &&
    !review.employeeAcknowledged &&
    onAcknowledge;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Detalhes da Avaliação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header info */}
          <Card className="bg-white dark:bg-slate-800/60 border border-border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Funcionário
                </div>
                <p className="text-sm font-medium">{employeeName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Avaliador
                </div>
                <p className="text-sm font-medium">{reviewerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <Badge
                variant="secondary"
                className={`text-xs ${statusColors?.bg ?? ''} ${statusColors?.text ?? ''} border-0`}
              >
                {statusLabel}
              </Badge>
              {review.employeeAcknowledged && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-300 border-0"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reconhecida
                </Badge>
              )}
            </div>
          </Card>

          {/* Scores */}
          <div className="space-y-2">
            {renderScore(review.selfScore, 'Autoavaliação')}
            {renderScore(review.managerScore, 'Gestor')}
            {review.finalScore !== null && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <Star className="h-5 w-5 text-violet-500 fill-violet-500" />
                <span className="text-base font-semibold">
                  {review.finalScore.toFixed(1)} -{' '}
                  {SCORE_LABELS[Math.round(review.finalScore)] ?? ''}
                </span>
                <span className="text-xs text-muted-foreground">(Nota final)</span>
              </div>
            )}
          </div>

          {/* Text sections */}
          <div className="space-y-4">
            {renderTextSection(
              <MessageSquare className="h-3.5 w-3.5" />,
              'Comentários (Autoavaliação)',
              review.selfComments
            )}
            {renderTextSection(
              <MessageSquare className="h-3.5 w-3.5" />,
              'Comentários (Gestor)',
              review.managerComments
            )}
            {renderTextSection(
              <ThumbsUp className="h-3.5 w-3.5" />,
              'Pontos Fortes',
              review.strengths
            )}
            {renderTextSection(
              <TrendingUp className="h-3.5 w-3.5" />,
              'Pontos de Melhoria',
              review.improvements
            )}
            {renderTextSection(
              <Target className="h-3.5 w-3.5" />,
              'Metas e Objetivos',
              review.goals
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span>
              Criada em:{' '}
              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
            </span>
            {review.completedAt && (
              <span>
                Concluída em:{' '}
                {new Date(review.completedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
            {review.acknowledgedAt && (
              <span>
                Reconhecida em:{' '}
                {new Date(review.acknowledgedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>

          {/* Actions */}
          {(showSelfAssessmentAction || showManagerReviewAction || showAcknowledgeAction) && (
            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              {showSelfAssessmentAction && (
                <Button
                  size="sm"
                  className="h-9 px-2.5 rounded-lg text-sm shadow-sm"
                  onClick={() => {
                    onOpenChange(false);
                    onSubmitSelfAssessment();
                  }}
                >
                  Preencher Autoavaliação
                </Button>
              )}
              {showManagerReviewAction && (
                <Button
                  size="sm"
                  className="h-9 px-2.5 rounded-lg text-sm shadow-sm"
                  onClick={() => {
                    onOpenChange(false);
                    onSubmitManagerReview();
                  }}
                >
                  Avaliar como Gestor
                </Button>
              )}
              {showAcknowledgeAction && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-2.5 rounded-lg text-sm"
                  onClick={() => {
                    onOpenChange(false);
                    onAcknowledge();
                  }}
                >
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Reconhecer Avaliação
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
