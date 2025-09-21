import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, File, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onSubmit: (data: { type: 'file' | 'link'; content: string; description: string }) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit, isLoading = false }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedFileTypes = [
    '.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.zip', '.rar', '.txt', '.md'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      toast({
        title: 'Unsupported File Type',
        description: 'Please upload PDF, DOCX, PNG, JPG, ZIP, or text files only.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description of your work.',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'file') {
      if (!uploadedFile) {
        toast({
          title: 'File Required',
          description: 'Please select a file to upload.',
          variant: 'destructive',
        });
        return;
      }

      // Create a proper file reference for blockchain storage
      // In production, upload to IPFS and use the hash
      const fileHash = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${uploadedFile.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      onSubmit({
        type: 'file',
        content: fileHash,
        description: description.trim(),
      });
    } else {
      if (!linkUrl.trim()) {
        toast({
          title: 'Link Required',
          description: 'Please provide a link to your work.',
          variant: 'destructive',
        });
        return;
      }

      // Validate URL format
      try {
        new URL(linkUrl);
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL (e.g., https://github.com/user/repo).',
          variant: 'destructive',
        });
        return;
      }

      onSubmit({
        type: 'link',
        content: linkUrl.trim(),
        description: description.trim(),
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'file' | 'link')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Link Upload
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <div>
            <Label htmlFor="workLink">Work Link</Label>
            <Input
              id="workLink"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              GitHub, Google Drive, Dropbox, or any public link
            </p>
          </div>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <div>
            <Label>Upload File</Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                {!uploadedFile ? (
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept={allowedFileTypes.join(',')}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, DOCX, PNG, JPG, ZIP (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div>
        <Label htmlFor="workDescription">Work Description</Label>
        <textarea
          id="workDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you've implemented, key features, and any important notes..."
          rows={4}
          className="w-full mt-1 px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        variant="success"
        className="w-full"
      >
        {isLoading ? 'Submitting...' : 'Submit Work'}
      </Button>
    </div>
  );
};

export default FileUpload;