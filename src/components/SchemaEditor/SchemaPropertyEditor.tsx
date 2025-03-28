import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getTypeColor, getTypeLabel } from "@/lib/utils";
import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "@/types/jsonSchema";
import {
  asObjectSchema,
  getSchemaDescription,
  isBooleanSchema,
  withObjectSchema,
} from "@/types/jsonSchema";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TypeEditor from "./TypeEditor";

export interface SchemaPropertyEditorProps {
  name: string;
  schema: JSONSchema;
  required: boolean;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
  onRequiredChange: (required: boolean) => void;
  onSchemaChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

export const SchemaPropertyEditor: React.FC<SchemaPropertyEditorProps> = ({
  name,
  schema,
  required,
  onDelete,
  onNameChange,
  onRequiredChange,
  onSchemaChange,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempDesc, setTempDesc] = useState(getSchemaDescription(schema));
  const type = withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );

  // Update temp values when props change
  useEffect(() => {
    setTempName(name);
    setTempDesc(getSchemaDescription(schema));
  }, [name, schema]);

  const handleNameSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== name) {
      onNameChange(trimmedName);
    } else {
      setTempName(name);
    }
    setIsEditingName(false);
  };

  const handleDescSubmit = () => {
    const trimmedDesc = tempDesc.trim();
    if (trimmedDesc !== getSchemaDescription(schema)) {
      onSchemaChange({
        ...asObjectSchema(schema),
        description: trimmedDesc || undefined,
      });
    } else {
      setTempDesc(getSchemaDescription(schema));
    }
    setIsEditingDesc(false);
  };

  // Handle schema changes, preserving description
  const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
    const description = getSchemaDescription(schema);
    onSchemaChange({
      ...updatedSchema,
      description: description || undefined,
    });
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border transition-all duration-200",
        depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
      )}
    >
      <div className="relative json-field-row justify-between group">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          {/* Expand/collapse button */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Property name */}
          <div className="flex flex-wrap items-center gap-2 flex-grow group">
            <div className="flex-grow flex flex-wrap items-center gap-2 min-w-[200px]">
              {isEditingName ? (
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                  className="h-8 text-sm font-medium min-w-[120px] max-w-full"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(true)}
                  className="json-field-label font-medium cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left max-w-full truncate"
                >
                  {name}
                </button>
              )}

              {/* Description */}
              {isEditingDesc ? (
                <Input
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  onBlur={handleDescSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleDescSubmit()}
                  placeholder="Add description..."
                  className="h-8 text-xs text-muted-foreground italic flex-1 min-w-[150px]"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              ) : tempDesc ? (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
                  className="text-xs text-muted-foreground italic max-w-full truncate cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left min-w-0 flex-1"
                >
                  {tempDesc}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
                  className="text-xs text-muted-foreground/50 italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all opacity-0 group-hover:opacity-100 text-left min-w-0 flex-1"
                >
                  Add description...
                </button>
              )}
            </div>

            {/* Type display */}
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <div
                className={cn(
                  "text-xs px-3.5 py-1.5 rounded-md font-medium w-[92px] text-center",
                  getTypeColor(type),
                )}
              >
                {getTypeLabel(type)}
              </div>

              {/* Required toggle */}
              <button
                type="button"
                onClick={() => onRequiredChange(!required)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md font-medium min-w-[80px] text-center cursor-pointer hover:shadow-sm hover:ring-2 hover:ring-ring/30 active:scale-95 transition-all whitespace-nowrap",
                  required
                    ? "bg-red-50 text-red-500"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {required ? "Required" : "Optional"}
              </button>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Delete field"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Type-specific editor */}
      {expanded && (
        <div className="pt-1 pb-2 px-2 sm:px-3 animate-in">
          <TypeEditor
            schema={schema}
            onChange={handleSchemaUpdate}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  );
};

export default SchemaPropertyEditor;
