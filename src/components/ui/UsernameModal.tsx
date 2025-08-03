'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent } from './card';
import { User, Play, MapPin } from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ isOpen, onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to VIGEOGUESSR!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Test your geography knowledge by guessing locations from street view images across Vietnam
          </DialogDescription>
        </DialogHeader>
        
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Choose your username</span>
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  maxLength={20}
                  autoFocus
                  className="text-center text-lg py-3"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {username.length}/20 characters
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={!username.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Playing
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}