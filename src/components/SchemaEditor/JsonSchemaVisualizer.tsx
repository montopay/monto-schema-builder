import { cn } from "@/lib/utils";
import { Check, Copy, FileJson } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { JSONSchemaType } from "./SchemaExample";

interface JsonSchemaVisualizerProps {
  schema: JSONSchemaType;
  className?: string;
  onChange?: (schema: JSONSchemaType) => void;
}

const JsonSchemaVisualizer: React.FC<JsonSchemaVisualizerProps> = ({
  schema,
  className,
  onChange,
}) => {
  const [jsonString, setJsonString] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableJson, setEditableJson] = useState("");

  useEffect(() => {
    const formatted = JSON.stringify(schema, null, 2);
    setJsonString(formatted);
    setEditableJson(formatted);
  }, [schema]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("JSON schema copied to clipboard");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      try {
        const parsedJson = JSON.parse(editableJson);
        if (onChange) {
          onChange(parsedJson);
        }
        setJsonString(JSON.stringify(parsedJson, null, 2));
        toast.success("JSON schema updated");
      } catch (error) {
        toast.error("Invalid JSON format");
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between bg-secondary/80 backdrop-blur-sm px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <FileJson size={18} />
          <span className="font-medium text-sm">JSON Schema</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEditToggle}
            className="p-1.5 rounded-md hover:bg-secondary-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={isEditing ? "Save changes" : "Edit JSON"}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1.5 rounded-md hover:bg-secondary-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Copy to clipboard"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      {isEditing ? (
        <textarea
          className="w-full bg-secondary/30 p-4 font-mono text-sm min-h-[500px] focus:outline-none focus:ring-1 focus:ring-primary/50"
          value={editableJson}
          onChange={(e) => setEditableJson(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <pre className="bg-secondary/30 p-4 overflow-auto max-h-[500px] text-sm">
          <code className="text-xs sm:text-sm font-mono">{jsonString}</code>
        </pre>
      )}
    </div>
  );
};

export default JsonSchemaVisualizer;
