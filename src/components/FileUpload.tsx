import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { DocumentFile } from '@/types';
import { getFileType, formatFileSize, estimatePageCount } from '@/lib/file-utils';

interface FileUploadProps {
  onFileSelect: (file: DocumentFile) => void;
  currentFile?: DocumentFile;
}

export default function FileUpload({ onFileSelect, currentFile }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileType = getFileType(file);
    if (fileType === 'unsupported') {
      alert('Please upload a PDF, DOCX, or ODT file.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 90) {
            clearInterval(progressInterval);
          }
          return next;
        });
      }, 100);

      const pageCount = await estimatePageCount(file);
      
      setUploadProgress(100);
      
      const documentFile: DocumentFile = {
        file,
        type: fileType,
        pages: pageCount,
        validationStatus: 'pending',
      };

      onFileSelect(documentFile);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = () => {
    onFileSelect({} as DocumentFile);
  };

  const getStatusIcon = (status: DocumentFile['validationStatus']) => {
    switch (status) {
      case 'validating':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />;
      case 'normalized':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: DocumentFile['validationStatus']) => {
    switch (status) {
      case 'validating':
        return 'Validating...';
      case 'normalized':
        return 'Ready for printing';
      case 'error':
        return 'Validation failed';
      default:
        return 'Ready to validate';
    }
  };

  if (currentFile?.file) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(currentFile.validationStatus)}
              <div>
                <h3 className="font-medium">{currentFile.file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(currentFile.file.size)} • {currentFile.pages} pages • {getStatusText(currentFile.validationStatus)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {currentFile.validationStatus === 'error' && currentFile.errors && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {currentFile.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Uploading your document...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your document here' : 'Upload your document'}
                </p>
                <p className="text-muted-foreground">
                  Drag & drop a PDF, DOCX, or ODT file here, or click to browse
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
                <span className="bg-gray-100 px-2 py-1 rounded">DOCX</span>
                <span className="bg-gray-100 px-2 py-1 rounded">ODT</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Max 50MB</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}