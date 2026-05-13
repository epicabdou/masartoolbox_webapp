import * as React from 'react';
import s from './card.module.css';

export function Card({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[s.card, className].join(' ')} {...p} />;
}
export function CardHeader({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[s.header, className].join(' ')} {...p} />;
}
export function CardTitle({ className = '', ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={[s.title, className].join(' ')} {...p} />;
}
export function CardDescription({ className = '', ...p }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={[s.description, className].join(' ')} {...p} />;
}
export function CardContent({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[s.content, className].join(' ')} {...p} />;
}
export function CardFooter({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={[s.footer, className].join(' ')} {...p} />;
}
