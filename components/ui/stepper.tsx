import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type StepperStepProps = {
  index: number;
  children: ReactNode;
};

function StepperStep({ children }: StepperStepProps) {
  return <>{children}</>;
}

StepperStep.displayName = "Stepper.Step";

export type StepperProps = {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
  ariaLabel?: string;
  showProgress?: boolean;
  children?: ReactNode;
};

function Stepper({
  steps,
  currentStep,
  onStepClick,
  ariaLabel = "Progreso",
  showProgress = true,
  children,
}: StepperProps) {
  const lastStep = steps.length;
  let activeStep: ReactElement<StepperStepProps> | null = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== StepperStep) return;
    const step = child as ReactElement<StepperStepProps>;
    if (step.props.index !== currentStep) return;
    activeStep = step;
  });

  return (
    <>
      {showProgress && (
        <nav className="card-sm" aria-label={ariaLabel}>
          <ol className="flex w-full flex-wrap items-center gap-x-2 gap-y-2 overflow-hidden">
            {steps.map((name, index) => {
              const number = index + 1;
              const completed = number < currentStep;
              const active = number === currentStep;
              return (
                <li
                  key={name}
                  className={`flex min-w-0 flex-1 items-center gap-2 ${number === lastStep ? "last:flex-none" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => onStepClick(number)}
                    aria-current={active ? "step" : undefined}
                    aria-label={`${name}, paso ${number}${completed ? ", completado" : active ? ", paso actual" : ", pendiente"}`}
                    className="group flex min-w-0 shrink-0 cursor-pointer flex-col gap-x-3 items-center rounded-lg text-left outline-none focus-visible:ring-4 focus-visible:ring-amount/20"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${completed ? "border-success-border bg-success-soft text-success" : active ? "border-amount bg-amount text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
                    >
                      {completed ? "✓" : number}
                    </span>
                    <span
                      className={`whitespace-nowrap text-sm font-bold ${active ? "text-foreground" : completed ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {name}
                    </span>
                  </button>
                  {number < lastStep && (
                    <span
                      aria-hidden="true"
                      className={`h-0.5 min-w-8 flex-1 ${completed ? "bg-success" : "bg-border"}`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      {activeStep}
    </>
  );
}

Stepper.Step = StepperStep;

export { Stepper };
