import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CoverDesign, CoverStyle, BookTemplate } from '@/types';
import { Upload, Wand2, Eye, Download, X } from 'lucide-react';

interface CoverDesignerProps {
  template: BookTemplate;
  pageCount: number;
  coverDesign: CoverDesign;
  onCoverDesignChange: (design: CoverDesign) => void;
}

const COVER_STYLES: CoverStyle[] = [
  {
    id: 'minimalist-1',
    name: 'Clean & Simple',
    thumbnail: 'https://via.placeholder.com/120x160/f8f9fa/1a1a1a?text=Clean',
    category: 'minimalist',
  },
  {
    id: 'minimalist-2',
    name: 'Modern Serif',
    thumbnail: 'https://via.placeholder.com/120x160/ffffff/2d3748?text=Serif',
    category: 'minimalist',
  },
  {
    id: 'photo-1',
    name: 'Photo Background',
    thumbnail: 'https://via.placeholder.com/120x160/1a1a1a/ffffff?text=Photo',
    category: 'photo',
  },
  {
    id: 'photo-2',
    name: 'Gradient Photo',
    thumbnail: 'https://via.placeholder.com/120x160/4f46e5/ffffff?text=Gradient',
    category: 'photo',
  },
  {
    id: 'illustration-1',
    name: 'Artistic Frame',
    thumbnail: 'https://via.placeholder.com/120x160/8b5cf6/ffffff?text=Art',
    category: 'illustration',
  },
  {
    id: 'illustration-2',
    name: 'Creative Design',
    thumbnail: 'https://via.placeholder.com/120x160/ec4899/ffffff?text=Creative',
    category: 'illustration',
  },
];

export default function CoverDesigner({ template, pageCount, coverDesign, onCoverDesignChange }: CoverDesignerProps) {
  const [bookTitle, setBookTitle] = useState('Your Book Title');
  const [authorName, setAuthorName] = useState('Author Name');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate spine width based on page count (rough estimation)
  const spineWidth = Math.max(0.2, pageCount * 0.002252);

  const handleStyleSelect = (style: CoverStyle) => {
    onCoverDesignChange({
      ...coverDesign,
      style,
      frontImage: undefined, // Clear custom image when selecting a style
      spineWidth,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Fichier sélectionné:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });

      // Validate file type - Support plus large de formats
      const validTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/webp',
        'image/gif',
        'image/bmp',
        'image/tiff'
      ];
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
        alert(`Format non supporté: ${file.type}\nFormats acceptés: JPEG, PNG, WebP, GIF, BMP, TIFF`);
        return;
      }

      // Validate file size (max 50MB pour plus de flexibilité)
      if (file.size > 50 * 1024 * 1024) {
        alert(`Fichier trop volumineux: ${Math.round(file.size / 1024 / 1024)}MB\nTaille maximum: 50MB`);
        return;
      }

      console.log('✅ Validation réussie, upload en cours...');
      
      onCoverDesignChange({
        ...coverDesign,
        frontImage: file,
        style: undefined,
        backCoverGenerated: false,
        spineWidth,
      });
      
      // Auto-generate back cover after upload
      setTimeout(() => {
        console.log('🎨 Génération du verso automatique...');
        generateBackCover();
      }, 500);
    }
    
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };

  const generateBackCover = () => {
    // Auto-generate back cover content based on uploaded front cover
    const backCoverData = {
      description: `${bookTitle || 'This compelling book'} offers readers an engaging journey through captivating storytelling and profound insights. With masterful narrative techniques and rich character development, this work stands as a testament to exceptional literary craftsmanship.`,
      authorBio: `${authorName || 'The author'} is a distinguished writer whose works have captivated readers worldwide. With a unique voice and compelling perspective, they bring years of experience and dedication to their craft.`,
      isbn: `978-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 90000 + 10000)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 10)}`,
      publisher: 'Independent Publishing',
      category: 'Literature & Fiction'
    };
    
    onCoverDesignChange({
      ...coverDesign,
      backCoverGenerated: true,
      backCoverData,
      spineWidth,
    });
  };

  const generateAICover = async () => {
    setIsGeneratingCover(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would call an AI service like DALL-E, Midjourney API, etc.
      const generatedImageUrl = `https://via.placeholder.com/600x900/4f46e5/ffffff?text=${encodeURIComponent(bookTitle)}`;
      
      onCoverDesignChange({
        ...coverDesign,
        frontImage: generatedImageUrl,
        style: {} as CoverStyle, // Clear style when generating AI image
        spineWidth,
      });
    } catch (error) {
      console.error('AI cover generation failed:', error);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const downloadTemplate = () => {
    // Create a downloadable template with proper dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas dimensions (300 DPI)
    const dpi = 300;
    const totalWidth = (template.dimensions.width * 2 + spineWidth) * dpi;
    const height = template.dimensions.height * dpi;
    
    canvas.width = totalWidth;
    canvas.height = height;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, height);
    
    // Add grid lines and guides
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    
    // Front cover area
    const frontWidth = template.dimensions.width * dpi;
    ctx.strokeRect(0, 0, frontWidth, height);
    
    // Spine area
    const spineWidthPx = spineWidth * dpi;
    ctx.strokeRect(frontWidth, 0, spineWidthPx, height);
    
    // Back cover area
    ctx.strokeRect(frontWidth + spineWidthPx, 0, frontWidth, height);
    
    // Add labels
    ctx.fillStyle = '#666666';
    ctx.font = `${24 * dpi / 72}px Arial`;
    ctx.textAlign = 'center';
    
    ctx.fillText('BACK COVER', frontWidth / 2, height / 2);
    ctx.fillText('SPINE', frontWidth + spineWidthPx / 2, height / 2);
    ctx.fillText('FRONT COVER', frontWidth + spineWidthPx + frontWidth / 2, height / 2);
    
    // Download the template
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `book-cover-template-${template.name.toLowerCase().replace(' ', '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  const previewCover = () => {
    const totalWidth = (template.dimensions.width * 2 + spineWidth) * 100;
    const height = template.dimensions.height * 100;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = totalWidth;
    canvas.height = height;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, height);
    
    const frontWidth = template.dimensions.width * 100;
    const spineWidthPx = spineWidth * 100;
    
    // Back cover
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, frontWidth, height);
    ctx.strokeStyle = '#e5e5e5';
    ctx.strokeRect(0, 0, frontWidth, height);
    
    // Back cover content
    if (coverDesign.backCoverGenerated && coverDesign.backCoverData) {
      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      
      const margin = 20;
      const lineHeight = 18;
      let y = margin + 20;
      
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Book Description', margin, y);
      y += lineHeight + 5;
      
      ctx.font = '12px Arial';
      const words = coverDesign.backCoverData.description.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > frontWidth - margin * 2 && line) {
          ctx.fillText(line, margin, y);
          line = word + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, margin, y);
      y += lineHeight + 15;
      
      ctx.font = 'bold 16px Arial';
      ctx.fillText('About the Author', margin, y);
      y += lineHeight + 5;
      
      ctx.font = '12px Arial';
      ctx.fillText(coverDesign.backCoverData.authorBio.substring(0, 100) + '...', margin, y);
      
      ctx.font = '10px Arial';
      ctx.fillText(`ISBN: ${coverDesign.backCoverData.isbn}`, margin, height - 40);
      ctx.fillText(coverDesign.backCoverData.category, margin, height - 25);
    } else {
      ctx.fillStyle = '#999999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BACK COVER', frontWidth / 2, height / 2);
      ctx.fillText('(Auto-generated)', frontWidth / 2, height / 2 + 25);
    }
    
    // Spine
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(frontWidth, 0, spineWidthPx, height);
    ctx.strokeRect(frontWidth, 0, spineWidthPx, height);
    
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(frontWidth + spineWidthPx / 2, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(bookTitle || 'Book Title', 0, 0);
    ctx.restore();
    
    // Front cover - Show uploaded image if available
    if (coverDesign.frontImage) {
      const img = new Image();
      img.onload = () => {
        // Draw the actual uploaded image
        ctx.drawImage(img, frontWidth + spineWidthPx, 0, frontWidth, height);
        ctx.strokeRect(frontWidth + spineWidthPx, 0, frontWidth, height);
        
        // Show preview
        const previewUrl = canvas.toDataURL();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Complete Book Cover Preview</title></head>
              <body style="margin:0;padding:20px;text-align:center;background:#f0f0f0;">
                <h2>Complete Book Cover Preview</h2>
                <p style="margin-bottom:20px;color:#666;">Back Cover | Spine | Front Cover (Your Upload)</p>
                <img src="${previewUrl}" style="max-width:90%;box-shadow:0 4px 8px rgba(0,0,0,0.1);border:1px solid #ddd;"/>
                <div style="margin-top:20px;text-align:left;max-width:800px;margin-left:auto;margin-right:auto;background:#f8f9fa;padding:15px;border-radius:8px;">
                  <h3 style="margin-top:0;">✅ Automated Features:</h3>
                  <p><strong>• Front Cover:</strong> Your uploaded image</p>
                  <p><strong>• Back Cover:</strong> Auto-generated with description, author bio, ISBN</p>
                  <p><strong>• Spine:</strong> Auto-calculated width (${spineWidth.toFixed(3)}") with title</p>
                  <p><strong>• Total Dimensions:</strong> ${(template.dimensions.width * 2 + spineWidth).toFixed(2)}" × ${template.dimensions.height}"</p>
                </div>
              </body>
            </html>
          `);
        }
      };
      
      // Convert File to URL if it's a File object
      if (coverDesign.frontImage instanceof File) {
        img.src = URL.createObjectURL(coverDesign.frontImage);
      } else {
        img.src = coverDesign.frontImage;
      }
    } else {
      // Generate front cover with style
      const bgColor = coverDesign.style?.category === 'photo' ? '#1a1a1a' : 
                     coverDesign.style?.category === 'illustration' ? '#4f46e5' : '#f8f9fa';
      ctx.fillStyle = bgColor;
      ctx.fillRect(frontWidth + spineWidthPx, 0, frontWidth, height);
      ctx.strokeRect(frontWidth + spineWidthPx, 0, frontWidth, height);
      
      const textColor = coverDesign.style?.category === 'photo' ? '#ffffff' : '#1a1a1a';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(bookTitle, frontWidth + spineWidthPx + frontWidth / 2, height / 2 - 20);
      
      ctx.font = '16px Arial';
      ctx.fillText(authorName, frontWidth + spineWidthPx + frontWidth / 2, height / 2 + 20);
      
      // Show preview
      const previewUrl = canvas.toDataURL();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Complete Book Cover Preview</title></head>
            <body style="margin:0;padding:20px;text-align:center;background:#f0f0f0;">
              <h2>Complete Book Cover Preview</h2>
              <p style="margin-bottom:20px;color:#666;">Back Cover | Spine | Front Cover</p>
              <img src="${previewUrl}" style="max-width:90%;box-shadow:0 4px 8px rgba(0,0,0,0.1);border:1px solid #ddd;"/>
              <div style="margin-top:20px;text-align:left;max-width:800px;margin-left:auto;margin-right:auto;background:#f8f9fa;padding:15px;border-radius:8px;">
                <h3 style="margin-top:0;">✅ Generated Cover:</h3>
                <p><strong>• Style:</strong> ${coverDesign.style?.name || 'Default'}</p>
                <p><strong>• Dimensions:</strong> ${(template.dimensions.width * 2 + spineWidth).toFixed(2)}" × ${template.dimensions.height}"</p>
              </div>
            </body>
          </html>
        `);
      }
    }
  };

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
            Choose a predefined style or upload your own custom cover image
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option 1: Use Predefined Styles */}
          <div>
            <h4 className="font-medium mb-3">Option 1: Use Predefined Style</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {COVER_STYLES.map((style) => {
                const isSelected = coverDesign.style?.id === style.id && !coverDesign.frontImage;
                
                return (
                  <div
                    key={style.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    } ${coverDesign.frontImage ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!coverDesign.frontImage) {
                        handleStyleSelect(style);
                      }
                    }}
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
            {!coverDesign.style?.id && !coverDesign.frontImage && (
              <p className="text-sm text-muted-foreground mt-2">
                Select a style to automatically generate your cover
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Option 2: Upload Custom Image */}
          <div>
            <h4 className="font-medium mb-3">Option 2: Upload Custom Cover</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Support : JPEG, PNG, WebP • Taille max : 10MB • Recommandé : 300 DPI
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => {
                  console.log('Upload button clicked');
                  fileInputRef.current?.click();
                }}
                disabled={!!coverDesign.style?.id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {coverDesign.frontImage ? 'Change Front Cover' : 'Upload Front Cover'}
              </Button>
              <Button 
                variant="outline" 
                onClick={generateAICover}
                disabled={isGeneratingCover || !!coverDesign.style?.id}
              >
                <Wand2 className={`h-4 w-4 mr-2 ${isGeneratingCover ? 'animate-spin' : ''}`} />
                {isGeneratingCover ? 'Generating...' : 'Generate with AI'}
              </Button>
              
              {coverDesign.frontImage && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={generateBackCover}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-Generate Back Cover
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onCoverDesignChange({
                        ...coverDesign,
                        frontImage: undefined,
                        backCoverGenerated: false,
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Custom Cover
                  </Button>
                </>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              key={Date.now()} // Force re-render to fix potential caching issues
            />
            
            {coverDesign.frontImage && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Custom cover image uploaded
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your custom image will be used instead of a predefined style
                </p>
              </div>
            )}
            
            {coverDesign.style?.id && (
              <p className="text-sm text-muted-foreground mt-2">
                Clear the selected style above to upload a custom image
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
              value={coverDesign.backText}
              onChange={(e) => onCoverDesignChange({ ...coverDesign, backText: e.target.value })}
              placeholder="Write a compelling description of your book..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="author-bio">Author Bio</Label>
            <Textarea
              id="author-bio"
              value={coverDesign.authorBio}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Front Cover</p>
              <p className="text-muted-foreground">{template.dimensions.width}" × {template.dimensions.height}"</p>
            </div>
            <div>
              <p className="font-medium">Spine Width</p>
              <p className="text-muted-foreground">{spineWidth.toFixed(3)}"</p>
            </div>
            <div>
              <p className="font-medium">Back Cover</p>
              <p className="text-muted-foreground">{template.dimensions.width}" × {template.dimensions.height}"</p>
            </div>
            <div>
              <p className="font-medium">Total Width</p>
              <p className="text-muted-foreground">{(template.dimensions.width * 2 + spineWidth).toFixed(2)}"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={previewCover}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Cover
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}