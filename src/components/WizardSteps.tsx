import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WizardStep } from '@/types';
import { Check, Circle } from 'lucide-react';

interface WizardStepsProps {
  steps: WizardStep[];
}

export default function WizardSteps({ steps }: WizardStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            {/* Step Content */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* Step Icon */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step.completed
                      ? 'border-green-500 bg-green-500'
                      : step.current
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Circle
                      className={`h-5 w-5 ${
                        step.current ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
                
                {/* Step Text */}
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      step.completed || step.current
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 && (
              <div className="absolute top-5 left-10 w-full h-0.5 bg-gray-200 hidden md:block">
                <div
                  className={`h-full transition-all duration-300 ${
                    step.completed ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                  }`}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
      
      {/* Mobile Step Indicator */}
      <div className="md:hidden mt-4 flex justify-center">
        <Badge variant="outline">
          Step {steps.findIndex(s => s.current) + 1} of {steps.length}
        </Badge>
      </div>
    </nav>
  );
}