import React, { useState } from 'react';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'json' | 'csv') => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300',
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>导出报告</span>
        <svg className={cn('w-4 h-4 transition-transform duration-300', isOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            <button
              onClick={() => {
                onExport('pdf');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold">
                PDF
              </div>
              <span className="font-medium text-gray-700">导出为 PDF</span>
            </button>

            <button
              onClick={() => {
                onExport('json');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {`{}`}
              </div>
              <span className="font-medium text-gray-700">导出为 JSON</span>
            </button>

            <button
              onClick={() => {
                onExport('csv');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">
                CSV
              </div>
              <span className="font-medium text-gray-700">导出为 CSV</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ExportButton;