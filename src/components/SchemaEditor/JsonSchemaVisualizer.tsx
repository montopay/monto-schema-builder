
import React from 'react';
import { cn } from '@/lib/utils';
import { FileJson, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface JsonSchemaVisualizerProps {
  schema: any;
  className?: string;
}

const JsonSchemaVisualizer: React.FC<JsonSchemaVisualizerProps> = ({ schema, className }) => {
  const jsonString = JSON.stringify(schema, null, 2);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success('JSON schema copied to clipboard');
  };
  
  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between bg-secondary/80 backdrop-blur-sm px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <FileJson size={18} />
          <span className="font-medium text-sm">JSON Schema</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-secondary-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
      </div>
      <pre className="bg-secondary/30 p-4 overflow-auto max-h-[500px] text-sm">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};

export default JsonSchemaVisualizer;
