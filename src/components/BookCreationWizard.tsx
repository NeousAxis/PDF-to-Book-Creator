import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentFile, BookTemplate, CoverDesign, CostCalculation, PrintJob, WizardStep, CoverStyle } from '@/types';
import { BOOK_TEMPLATES } from '@/lib/lulu-api';
import WizardSteps from './WizardSteps';
import FileUpload from './FileUpload';
import TemplateSelector from './TemplateSelector';
import CoverDesigner from './CoverDesigner';
import CostCalculator from './CostCalculator';
import PrintJobSubmission from './PrintJobSubmission';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'upload',
    title: 'Upload Document',
    description: 'Add your PDF, DOCX, or ODT file',
    completed: false,
    current: true,
  },
  {
    id: 'template',
    title: 'Select Layout',
    description: 'Choose book format and size',
    completed: false,
    current: false,
  },
  {
    id: 'cover',
    title: 'Design Cover',
    description: 'Create your book cover',
    completed: false,
    current: false,
  },
  {
    id: 'cost',
    title: 'Review Cost',
    description: 'Calculate printing costs',
    completed: false,
    current: false,
  },
  {
    id: 'submit',
    title: 'Submit Order',
    description: 'Send to printer',
    completed: false,
    current: false,
  },
];

export default function BookCreationWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState(WIZARD_STEPS);
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null);
  const [coverDesign, setCoverDesign] = useState<CoverDesign>({
    backText: '',
    authorBio: '',
    style: undefined,
    spineWidth: 0.2,
    backCoverGenerated: false,
  });
  const [costCalculation, setCostCalculation] = useState<CostCalculation | null>(null);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);

  const updateSteps = (stepIndex: number, completed = false) => {
    setSteps(prevSteps =>
      prevSteps.map((step, index) => ({
        ...step,
        completed: index < stepIndex || completed,
        current: index === stepIndex,
      }))
    );
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      updateSteps(nextIndex);
      
      // Scroll to top of the page when changing steps
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      updateSteps(prevIndex);
      
      // Scroll to top of the page when changing steps
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const canProceed = () => {
    switch (currentStepIndex) {
      case 0: // Upload
        return document?.file && document.validationStatus !== 'error';
      case 1: // Template
        return selectedTemplate !== null;
      case 2: // Cover
        return selectedTemplate && 
               (coverDesign.style?.id || coverDesign.frontImage || coverDesign.backCoverGenerated) &&
               document?.pages && document.pages > 0;
      case 3: // Cost
        return costCalculation !== null;
      case 4: // Submit
        return printJob !== null;
      default:
        return false;
    }
  };

  const handleFileSelect = (file: DocumentFile) => {
    setDocument(file);
    // Simulate file validation
    setTimeout(() => {
      if (file.file) {
        setDocument(prev => prev ? { ...prev, validationStatus: 'normalized' } : null);
      }
    }, 2000);
  };

  const handleTemplateSelect = (template: BookTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCoverDesignChange = (design: CoverDesign) => {
    setCoverDesign(design);
  };

  const handleCostCalculated = (cost: CostCalculation) => {
    setCostCalculation(cost);
  };

  const handleJobSubmitted = (job: PrintJob) => {
    setPrintJob(job);
    updateSteps(currentStepIndex, true);
  };

  const renderCurrentStep = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <FileUpload
            onFileSelect={handleFileSelect}
            currentFile={document || undefined}
          />
        );
      case 1:
        return (
          <TemplateSelector
            selectedTemplate={selectedTemplate || undefined}
            onTemplateSelect={handleTemplateSelect}
          />
        );
      case 2:
        if (!selectedTemplate || !document) {
          return <div>Please complete previous steps first.</div>;
        }
        return (
          <CoverDesigner
            template={selectedTemplate}
            pageCount={document.pages}
            coverDesign={coverDesign}
            onCoverDesignChange={handleCoverDesignChange}
          />
        );
      case 3:
        if (!selectedTemplate || !document) {
          return <div>Please complete previous steps first.</div>;
        }
        return (
          <CostCalculator
            template={selectedTemplate}
            pageCount={document.pages}
            onCostCalculated={handleCostCalculated}
          />
        );
      case 4:
        if (!document || !selectedTemplate || !costCalculation) {
          return <div>Please complete previous steps first.</div>;
        }
        return (
          <PrintJobSubmission
            document={document}
            template={selectedTemplate}
            coverDesign={coverDesign}
            costCalculation={costCalculation}
            onJobSubmitted={handleJobSubmitted}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            PDF to Book Creator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your document into a professional print-ready book with our one-click solution
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <WizardSteps steps={steps} />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {!printJob && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStepIndex === steps.length - 1 || !canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}