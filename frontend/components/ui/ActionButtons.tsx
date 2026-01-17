import React from 'react';
import ExportButton from './ExportButton';
import ShareButton from './ShareButton';

interface ActionButtonsProps {
  onExport: (format: 'pdf' | 'json' | 'csv') => void;
  shareUrl: string;
  shareTitle?: string;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExport,
  shareUrl,
  shareTitle,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-4">
      <ExportButton onExport={onExport} disabled={disabled} />
      <ShareButton url={shareUrl} title={shareTitle} disabled={disabled} />
    </div>
  );
};

export default ActionButtons;