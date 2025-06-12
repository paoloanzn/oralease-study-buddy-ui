
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/hooks/useNotes';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const { createNote } = useNotes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    createNote.mutate(
      { title, content, subject },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setSubject('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setSubject('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Notes</DialogTitle>
          <DialogDescription>
            Add your study materials to create personalized oral exam questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Biology, History, Chemistry"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study notes here..."
              rows={6}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNote.isPending || !title.trim()}
            >
              {createNote.isPending ? 'Creating...' : 'Create Notes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
