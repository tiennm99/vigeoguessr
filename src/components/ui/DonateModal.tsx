'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Coffee, Heart, X } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-center justify-center">
            <Coffee className="h-5 w-5 text-orange-500" />
            <span>Support VIGEOGUESSR</span>
            <Heart className="h-4 w-4 text-red-500" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-0 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                If you enjoy playing VIGEOGUESSR, consider buying me a coffee! 
                Your support helps keep this project running and free for everyone.
              </p>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <Image 
                  src="/QR.png" 
                  width={200} 
                  height={200} 
                  alt="Donation QR Code"
                  className="mx-auto rounded-md"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Scan QR code to donate
              </p>
            </CardContent>
          </Card>
          
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}