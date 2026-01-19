import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
    steps: string[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn('flex w-full items-center justify-center space-x-4', className)}>
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isPending = index > currentStep;

                return (
                    <div key={step} className="flex items-center">
                        {/* Step Indicator */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                                    isCurrent && 'border-primary text-primary',
                                    isPending && 'border-muted-foreground/30 text-muted-foreground'
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    isCompleted && 'text-primary',
                                    isCurrent && 'text-primary',
                                    isPending && 'text-muted-foreground'
                                )}
                            >
                                {step}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-4 h-[2px] w-12 sm:w-24',
                                    index < currentStep ? 'bg-primary' : 'bg-muted'
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
