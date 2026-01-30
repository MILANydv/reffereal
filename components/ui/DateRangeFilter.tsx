'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './Button';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type DateRangePreset = '7d' | '30d' | '90d' | 'custom' | 'all';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
}

export function DateRangeFilter({ value, onChange, presets = ['7d', '30d', '90d', 'custom'] }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('30d');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const applyPreset = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    setShowCustomPicker(false);

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now;

    switch (preset) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = null;
        endDate = null;
        break;
      case 'custom':
        setShowCustomPicker(true);
        return;
    }

    onChange({ startDate, endDate });
  };

  const handleCustomDateChange = (type: 'start' | 'end', date: string) => {
    const newDate = date ? new Date(date) : null;
    const newRange = {
      ...value,
      [type === 'start' ? 'startDate' : 'endDate']: newDate,
    };
    onChange(newRange);
    if (newRange.startDate && newRange.endDate) {
      setSelectedPreset('custom');
      setShowCustomPicker(false);
    }
  };

  const formatDateRange = () => {
    if (!value.startDate && !value.endDate) return 'All Time';
    if (!value.startDate) return 'Custom';
    if (!value.endDate) return 'Custom';
    
    const start = value.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = value.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Calendar size={16} />
            <span>{formatDateRange()}</span>
            <ChevronDown size={16} className={showCustomPicker ? 'rotate-180' : ''} />
          </Button>

          {showCustomPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        selectedPreset === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset === '7d' ? 'Last 7 days' : preset === '30d' ? 'Last 30 days' : preset === '90d' ? 'Last 90 days' : preset === 'all' ? 'All Time' : 'Custom'}
                    </button>
                  ))}
                </div>

                {selectedPreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={value.startDate ? value.startDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleCustomDateChange('start', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={value.endDate ? value.endDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => handleCustomDateChange('end', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCustomPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCustomPicker(false)}
        />
      )}
    </div>
  );
}
