'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store';
import { Button } from './button';
import { Warning } from '@phosphor-icons/react/dist/ssr';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const { isDark } = useThemeStore();

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className={`rounded-lg border shadow-2xl w-full max-w-md overflow-hidden ${
            isDark
              ? 'bg-[#3a2f4a] border-[#3a2f4a]'
              : 'bg-white border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  variant === 'destructive'
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <Warning
                  size={24}
                  weight="fill"
                  className={
                    variant === 'destructive'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }
                />
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={onCancel}
                className="min-w-[80px]"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'default'}
                onClick={onConfirm}
                className="min-w-[80px]"
                style={
                  variant === 'destructive'
                    ? { background: '#ef4444' }
                    : { background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)' }
                }
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

