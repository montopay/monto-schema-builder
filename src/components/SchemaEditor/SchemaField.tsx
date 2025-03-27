import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SchemaType } from "@/types/jsonSchema";
import type { NewField } from "@/types/schema";
import { ChevronDown, ChevronRight, ChevronUp, Edit, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface SchemaFieldProps {
  name: string;
  type: SchemaType;
  description?: string;
  required?: boolean;
  children?: React.ReactNode;
  onDelete: () => void;
  onEdit: (field: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const getTypeColor = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "text-blue-500 bg-blue-50";
    case "number":
    case "integer":
      return "text-purple-500 bg-purple-50";
    case "boolean":
      return "text-green-500 bg-green-50";
    case "object":
      return "text-orange-500 bg-orange-50";
    case "array":
      return "text-pink-500 bg-pink-50";
  }
};

const getTypeLabel = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "Text";
    case "number":
    case "integer":
      return "Number";
    case "boolean":
      return "Yes/No";
    case "object":
      return "Group";
    case "array":
      return "List";
  }
};

interface FieldDisplayProps {
  name: string;
  type: SchemaType;
  required: boolean;
  description: string;
  onTypeChange: (type: SchemaType) => void;
  onRequiredChange: (required: boolean) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

const FieldDisplay: React.FC<FieldDisplayProps> = ({
  name,
  type,
  required,
  description,
  onTypeChange,
  onRequiredChange,
  onNameChange,
  onDescriptionChange,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 flex-grow group">
      <div className="flex-grow flex items-center gap-2">
        {isEditingName ? (
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            className="h-8 text-sm font-medium"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(true)}
            className="json-field-label font-medium cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left"
          >
            {name}
          </button>
        )}
        {isEditingDesc ? (
          <Input
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onBlur={() => setIsEditingDesc(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(false)}
            placeholder="Add description..."
            className="h-8 text-xs text-muted-foreground italic flex-1"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : description ? (
          <button
            type="button"
            onClick={() => setIsEditingDesc(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
            className="text-xs text-muted-foreground italic max-w-[300px] truncate cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left"
          >
            {description}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingDesc(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
            className="text-xs text-muted-foreground/50 italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all opacity-0 group-hover:opacity-100 text-left"
          >
            Add description...
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTypeOpen(!isTypeOpen)}
            onKeyDown={(e) => e.key === "Enter" && setIsTypeOpen(!isTypeOpen)}
            className={cn(
              "text-xs px-3.5 py-1.5 rounded-md font-medium w-[92px] text-left cursor-pointer hover:shadow-sm hover:ring-1 hover:ring-ring/20 active:scale-[0.98] transition-all flex items-center justify-between gap-2",
              getTypeColor(type),
              isTypeOpen && "ring-2 ring-ring/30",
            )}
          >
            {getTypeLabel(type)}
            <ChevronDown
              size={14}
              className={cn(
                "text-current opacity-60 transition-transform duration-200",
                isTypeOpen && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "absolute right-0 top-[calc(100%+6px)] w-[160px] rounded-lg shadow-lg border border-border/40 bg-popover/95 backdrop-blur-sm p-2 transition-all duration-200 origin-top-right z-50",
              isTypeOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none",
            )}
          >
            {["string", "number", "boolean", "object", "array"].map((t, i) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  onTypeChange(t as SchemaType);
                  setIsTypeOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 flex items-center justify-between gap-2 group relative",
                  getTypeColor(t as SchemaType),
                  "hover:ring-1 hover:ring-ring/20 hover:shadow-sm",
                  t === type && "ring-1 ring-ring/40 shadow-sm",
                  i > 0 && "mt-2",
                )}
              >
                <span className="font-medium">
                  {getTypeLabel(t as SchemaType)}
                </span>
                {t === type && (
                  <ChevronRight size={14} className="text-current opacity-60" />
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRequiredChange(!required)}
          className={cn(
            "text-xs px-2 py-1 rounded-md font-medium w-20 text-center cursor-pointer hover:shadow-sm hover:ring-2 hover:ring-ring/30 active:scale-95 transition-all",
            required
              ? "bg-red-50 text-red-500"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {required ? "Required" : "Optional"}
        </button>
      </div>
    </div>
  );
};

interface ExpandButtonProps {
  expanded: boolean;
  onClick: () => void;
}

const ExpandButton: React.FC<ExpandButtonProps> = ({ expanded, onClick }) => (
  <button
    type="button"
    className="text-muted-foreground hover:text-foreground transition-colors"
    onClick={onClick}
    aria-label={expanded ? "Collapse" : "Expand"}
  >
    {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
  </button>
);

interface FieldActionsProps {
  onDelete: () => void;
}

const FieldActions: React.FC<FieldActionsProps> = ({ onDelete }) => (
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
);

interface FieldContentProps {
  isEditing: boolean;
  fieldName: string;
  setFieldName: (name: string) => void;
  fieldType: SchemaType;
  setFieldType: (type: SchemaType) => void;
  fieldDesc: string;
  setFieldDesc: (desc: string) => void;
  fieldRequired: boolean;
  setFieldRequired: (required: boolean) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  name: string;
  type: SchemaType;
  required: boolean;
  description: string;
}

const FieldContent: React.FC<FieldContentProps> = ({
  isEditing,
  fieldName,
  setFieldName,
  fieldType,
  setFieldType,
  fieldDesc,
  setFieldDesc,
  fieldRequired,
  setFieldRequired,
  onSave,
  onCancelEdit,
  name,
  type,
  required,
  description,
}) =>
  isEditing ? (
    <div className="flex items-center gap-2 flex-grow">
      <select
        value={fieldType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const value = e.target.value;
          if (
            value === "string" ||
            value === "number" ||
            value === "boolean" ||
            value === "object" ||
            value === "array"
          ) {
            setFieldType(value);
          }
        }}
        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm w-24"
      >
        <option value="string">Text</option>
        <option value="number">Number</option>
        <option value="boolean">Yes/No</option>
        <option value="object">Group</option>
        <option value="array">List</option>
      </select>
      <Switch
        checked={fieldRequired}
        onCheckedChange={setFieldRequired}
        className="data-[state=checked]:bg-red-500"
      />
      <Input
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
        placeholder="Field name"
        className="h-8 text-sm w-40"
      />
      <Input
        value={fieldDesc}
        onChange={(e) => setFieldDesc(e.target.value)}
        placeholder="Description (optional)"
        className="h-8 text-sm flex-1"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelEdit}
          className="h-8"
        >
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} className="h-8">
          Save
        </Button>
      </div>
    </div>
  ) : (
    <FieldDisplay
      name={name}
      type={type}
      required={required}
      description={description}
      onTypeChange={(type) => setFieldType(type)}
      onRequiredChange={(required) => setFieldRequired(required)}
      onNameChange={(name) => setFieldName(name)}
      onDescriptionChange={(description) => setFieldDesc(description)}
    />
  );

const SchemaField: React.FC<SchemaFieldProps> = ({
  name,
  type,
  description = "",
  required = false,
  children,
  onDelete,
  onEdit,
  isNested = false,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [fieldName, setFieldName] = useState(name);
  const [fieldType, setFieldType] = useState<SchemaType>(type);
  const [fieldDesc, setFieldDesc] = useState(description);
  const [fieldRequired, setFieldRequired] = useState(required);

  const isExpandable = type === "object" || type === "array";

  const handleFieldChange = (changes: Partial<NewField>) => {
    const newField = {
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: fieldRequired,
      ...changes,
    };
    setFieldName(newField.name);
    setFieldType(newField.type);
    setFieldDesc(newField.description);
    setFieldRequired(newField.required);
    onEdit(newField);
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border border-border transition-all duration-200",
        depth > 0 && "ml-4 border-l-2",
        isNested && "mt-2",
      )}
    >
      <div className="relative json-field-row justify-between group">
        <div className="flex items-center gap-2 flex-grow">
          {isExpandable && (
            <ExpandButton
              expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            />
          )}

          <FieldDisplay
            name={fieldName}
            type={fieldType}
            required={fieldRequired}
            description={fieldDesc}
            onTypeChange={(type) => handleFieldChange({ type })}
            onRequiredChange={(required) => handleFieldChange({ required })}
            onNameChange={(name) => handleFieldChange({ name })}
            onDescriptionChange={(description) =>
              handleFieldChange({ description })
            }
          />
        </div>

        <FieldActions onDelete={onDelete} />
      </div>

      {expanded && isExpandable && (
        <div className="pt-1 pb-2 px-2 animate-in">{children}</div>
      )}
    </div>
  );
};

export default SchemaField;
