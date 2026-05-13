'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import s from './dialog.module.css';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = '', ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={[s.overlay, className].join(' ')} {...props} />
));
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={[s.content, className].join(' ')} {...props}>
      {children}
      <DialogPrimitive.Close className={s.close}>
        <X size={16} color="var(--text-muted)" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[s.header, className].join(' ')} {...p} />;
}
export function DialogTitle({ className = '', ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={[s.dialogTitle, className].join(' ')} {...p} />;
}
export function DialogDescription({ className = '', ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={[s.dialogDescription, className].join(' ')} {...p} />;
}
