'use client';

import { Button } from './button';
import { Coffee, MapPin } from 'lucide-react';

interface HeaderProps {
  onDonateClick: () => void;
}

export default function Header({ onDonateClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            VIGEOGUESSR
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDonateClick}
          className="flex items-center space-x-2 hover:bg-orange-50 hover:border-orange-200 transition-colors"
        >
          <Coffee className="h-4 w-4" />
          <span>Buy me coffee</span>
        </Button>
      </div>
    </header>
  );
}