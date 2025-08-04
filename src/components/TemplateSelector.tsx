import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookTemplate } from '@/types';
import { BOOK_TEMPLATES } from '@/lib/lulu-api';
import { Check, BookOpen } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate?: BookTemplate;
  onTemplateSelect: (template: BookTemplate) => void;
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Book Layout</h2>
        <p className="text-muted-foreground">
          Select a template that best fits your content and target audience
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOOK_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  {isSelected && <Check className="h-5 w-5 text-blue-500" />}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Dimensions:</span>
                    <span>{template.dimensions.width}" × {template.dimensions.height}"</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Margins:</span>
                    <span>{template.margins.top}" all sides</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Gutter:</span>
                    <span>{template.margins.gutter}"</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Bleed:</span>
                    <span>{template.bleed}"</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Badge variant={isSelected ? 'default' : 'secondary'} className="w-full justify-center">
                    {isSelected ? 'Selected' : 'Select Template'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedTemplate && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">
                  {selectedTemplate.name} template selected
                </p>
                <p className="text-sm text-green-600">
                  Your document will be formatted to {selectedTemplate.dimensions.width}" × {selectedTemplate.dimensions.height}" with professional margins and bleed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}