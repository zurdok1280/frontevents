import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface ContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    context: string;
}

export const ContextModal = ({ isOpen, onClose, title, context }: ContextModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{title}</span>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {context || "Sin contexto disponible"}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};