import { ReactNode, useState } from 'react';

import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

interface ConfirmDialogProps {
    /** Element that opens the dialog. Omit when controlling `open` externally. */
    trigger?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Extra content rendered between the header and footer. */
    children?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    confirmVariant?: ButtonProps['variant'];
    /** Return a promise to keep the dialog open with a spinner until it settles. */
    onConfirm: () => void | Promise<unknown>;
    onCancel?: () => void;
    /** Externally managed busy state, e.g. Inertia `useForm().processing`. */
    processing?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function ConfirmDialog({
    trigger,
    title,
    description,
    children,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmVariant = 'default',
    onConfirm,
    onCancel,
    processing = false,
    open,
    onOpenChange,
}: ConfirmDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const isBusy = processing || isConfirming;

    const setOpen = (nextOpen: boolean) => {
        if (isBusy && !nextOpen) {
            return;
        }

        if (!isControlled) {
            setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
    };

    const handleConfirm = async () => {
        const result = onConfirm();

        if (result instanceof Promise) {
            setIsConfirming(true);

            try {
                await result;
            } finally {
                setIsConfirming(false);
            }
        }

        if (!isControlled) {
            setInternalOpen(false);
        }

        onOpenChange?.(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isBusy} onClick={onCancel}>
                            {cancelLabel}
                        </Button>
                    </DialogClose>
                    <Button variant={confirmVariant} disabled={isBusy} onClick={handleConfirm}>
                        {isBusy && <Spinner />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
