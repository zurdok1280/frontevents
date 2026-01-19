import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { LoginForm } from './LoginForm';

export function LoginButton() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowLoginDialog(true)}
        className="group flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-md"
      >
        <span className="relative z-10 flex items-center gap-2">
          <LogIn className="h-2 w-2 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="sm:hidden"> </span>
        </span>
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acceso a miembros</DialogTitle>
          </DialogHeader>
          <LoginForm onClose={() => setShowLoginDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}