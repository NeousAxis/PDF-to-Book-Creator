import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CoverDesign, CoverStyle, BookTemplate } from '@/types';
import { Upload, Wand2, Eye, Download, X, Eraser } from 'lucide-react';
import { generateCover } from '@/lib/cover-generator';

interface CoverDesignerProps {
  template: BookTemplate;
  pageCount: number;
  coverDesign: CoverDesign;
  onCoverDesignChange: (design: CoverDesign) => void;
}

const COVER_STYLES: CoverStyle[] = [
  { id: 'minimalist-1', name: 'Clean & Simple', thumbnail: 'https://placehold.co/120x160/f0f0f0/333333?text=Clean\nSimple&font=sans-serif', category: 'minimalist' },
  { id: 'minimalist-2', name: 'Modern Serif', thumbnail: 'https://placehold.co/120x160/ffffff/4a5568?text=Modern\nSerif&font=serif', category: 'minimalist' },
  
  { id: 'photo-2', name: 'Gradient Photo', thumbnail: 'https://placehold.co/120x160/4f46e5/ffffff?text=Gradient\nOverlay&font=sans-serif', category: 'photo' },
  { id: 'illustration-1', name: 'Artistic Frame', thumbnail: 'https://placehold.co/120x160/8b5cf6/ffffff?text=Artistic\nFrame&font=serif', category: 'illustration' },
  { id: 'illustration-2', name: 'Creative Design', thumbnail: 'https://placehold.co/120x160/ec4899/ffffff?text=Creative\nDesign&font=sans-serif', category: 'illustration' },
];

export default function CoverDesigner({ template, pageCount, coverDesign, onCoverDesignChange }: CoverDesignerProps) {
  const [bookTitle, setBookTitle] = useState('Your Book Title');
  const [authorName, setAuthorName] = useState('Author Name');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const spineWidth = Math.max(0.2, pageCount * 0.002252);

  const handleStyleSelect = (styleToSelect: CoverStyle) => {
    onCoverDesignChange({
      ...coverDesign,
      style: styleToSelect,
      frontImage: undefined, // Clear custom image when changing style selection
      spineWidth,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCoverDesignChange({
        ...coverDesign,
        frontImage: file,
        style: undefined,
      });
    }
  };

  const handleGenerateStyledCover = async () => {
    setIsGeneratingCover(true);
    try {
      const generatedFile = await generateCover({
        title: bookTitle || 'Untitled Book',
        backCoverText: coverDesign.backText || '',
        authorBio: coverDesign.authorBio || '',
        widthInches: template.dimensions.width,
        heightInches: template.dimensions.height,
        spineWidthInches: spineWidth,
      });

      onCoverDesignChange({
        ...coverDesign,
        frontImage: generatedFile,
        style: coverDesign.style, // Keep the selected style for reference
      });
    } catch (error) {
      console.error('Styled cover generation failed:', error);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleClearCoverSelection = () => {
    onCoverDesignChange({
      ...coverDesign,
      frontImage: undefined,
      style: undefined,
    });
  };

  const downloadTemplate = () => {
    // ... (le code de cette fonction reste le même)
  };

  const previewCover = () => {
    // ... (le code de cette fonction reste le même)
  };

  const isCustomImageSelected = !!coverDesign.frontImage;
  const isStyleSelected = !!coverDesign.style;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Design Your Cover</h2>
        <p className="text-muted-foreground">
          Create an eye-catching cover that represents your book perfectly
        </p>
      </div>

      {/* Book Info */}
      <Card>
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="book-title">Book Title</Label>
              <Input
                id="book-title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Enter your book title"
              />
            </div>
            <div>
              <Label htmlFor="author-name">Author Name</Label>
              <Input
                id="author-name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Design Options */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Design Options</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose how you want to create your book cover.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option: Generate Styled Cover */}
          <div>
            <h4 className="font-medium mb-3">Option 1: Generate a Styled Cover</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {COVER_STYLES.map((style) => {
                const isSelected = coverDesign.style?.id === style.id;
                
                return (
                  <div
                    key={style.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isCustomImageSelected ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => handleStyleSelect(style)}
                  >
                    <div className="relative">
                      <img
                        src={style.thumbnail}
                        alt={style.name}
                        className="w-full rounded-md"
                      />
                      <Badge
                        variant={isSelected ? 'default' : 'secondary'}
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs"
                      >
                        {style.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-center mt-2 font-medium">{style.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleGenerateStyledCover}
                disabled={isGeneratingCover || isCustomImageSelected}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Wand2 className={`h-4 w-4 mr-2 ${isGeneratingCover ? 'animate-spin' : ''}`} />
                {isGeneratingCover ? 'Generating...' : 'Generate Styled Cover'}
              </Button>
              {isStyleSelected && (
                <Button 
                  variant="outline" 
                  onClick={() => handleClearCoverSelection()}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear Style Selection
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Option: Upload Custom Image */}
          <div>
            <h4 className="font-medium mb-3">Option 2: Upload Custom Cover</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isStyleSelected}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isCustomImageSelected ? 'Change Custom Cover' : 'Upload Custom Cover'}
              </Button>
              {isCustomImageSelected && (
                <Button 
                  variant="outline" 
                  onClick={() => handleClearCoverSelection()}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Custom Cover
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display current cover selection */}
      {(isCustomImageSelected || isStyleSelected) && (
        <Card className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Current Cover Selection:
            {isCustomImageSelected ? 
              ` Custom Image (${typeof coverDesign.frontImage === 'object' ? coverDesign.frontImage.name : ''})` : 
              ` Styled Cover (${coverDesign.style?.name || 'Default'})`
            }
          </p>
        </Card>
      )}

      {/* Back Cover Text */}
      <Card>
        <CardHeader>
          <CardTitle>Back Cover Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="back-text">Book Description/Blurb</Label>
            <Textarea
              id="back-text"
              value={coverDesign.backText || ''}
              onChange={(e) => onCoverDesignChange({ ...coverDesign, backText: e.target.value })}
              placeholder="Write a compelling description of your book..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="author-bio">Author Bio</Label>
            <Textarea
              id="author-bio"
              value={coverDesign.authorBio || ''}
              onChange={(e) => onCoverDesignChange({ ...coverDesign, authorBio: e.target.value })}
              placeholder="Brief author biography..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cover Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* Le contenu de cette carte reste le même, il n'est pas inclus ici pour la lisibilité */}
        </CardContent>
      </Card>
    </div>
  );
}