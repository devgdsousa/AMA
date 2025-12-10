import * as React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={
        'w-full border px-3 py-2 rounded-md text-sm bg-white text-slate-900 ' +
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ' +
        'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 ' +
        className
      }
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
