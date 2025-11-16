'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExtraAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  ariaLabel?: string;
}

interface TripActionsPanelProps {
  isDark: boolean;
  status: 'draft' | 'published';
  onStatusChange: (status: 'draft' | 'published') => void;
  onSave: () => void;
  saving: boolean;
  saveLabel?: string;
  extraActions?: ExtraAction[];
}

export function TripActionsPanel({
  isDark,
  status,
  onStatusChange,
  onSave,
  saving,
  saveLabel = 'Save Changes',
  extraActions,
}: TripActionsPanelProps) {
  return (
    <div>
      <div className="space-y-4">
        <div>
          <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'draft' | 'published')}
            className={`w-full px-3 py-2 border rounded-md cursor-pointer ${
              isDark ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Draft trips stay hidden. Publish to make it live.
          </p>
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : saveLabel}
        </Button>
      </div>

      {extraActions && extraActions.length > 0 && (
        <div
          className="flex items-center gap-3 pt-4 mt-4 border-t"
          style={{ borderColor: isDark ? '#4a3f5a' : '#E5E7EB' }}
        >
          {extraActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel || action.label}
              className={cn(
                'flex-1 h-10 flex items-center justify-center rounded-md border transition-colors cursor-pointer gap-2',
                action.tone === 'danger'
                  ? isDark
                    ? 'border-[#4a3f5a] text-red-300 hover:bg-[#4a3f5a]'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                  : isDark
                  ? 'border-[#3a2f4a] text-gray-100 hover:bg-[#4a3f5a]'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              )}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


