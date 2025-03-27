import type { SchemaType } from "@/components/SchemaEditor/SchemaExample";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { NewField } from "@/types/schema";
import { ChevronDown, ChevronUp, Edit, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

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
      return "Number";
    case "boolean":
      return "Yes/No";
    case "object":
      return "Group";
    case "array":
      return "List";
  }
};

interface EditFormProps {
  fieldName: string;
  setFieldName: (name: string) => void;
  fieldType: SchemaType;
  setFieldType: (type: SchemaType) => void;
  fieldDesc: string;
  setFieldDesc: (desc: string) => void;
  fieldRequired: boolean;
  setFieldRequired: (required: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({
  fieldName,
  setFieldName,
  fieldType,
  setFieldType,
  fieldDesc,
  setFieldDesc,
  fieldRequired,
  setFieldRequired,
  onSave,
  onCancel,
}) => (
  <div className="flex flex-col gap-3 py-3 w-full">
    <div className="flex items-center gap-3">
      <Input
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
        placeholder="Field name"
        className="h-8 text-sm"
      />
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
        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
      >
        <option value="string">Text</option>
        <option value="number">Number</option>
        <option value="boolean">Yes/No</option>
        <option value="object">Group</option>
        <option value="array">List</option>
      </select>
    </div>

    <Input
      value={fieldDesc}
      onChange={(e) => setFieldDesc(e.target.value)}
      placeholder="Description (optional)"
      className="h-8 text-sm"
    />

    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={fieldRequired}
          onChange={(e) => setFieldRequired(e.target.checked)}
          className="rounded border-gray-300"
        />
        Required
      </label>

      <div className="flex gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8"
        >
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} className="h-8">
          Save
        </Button>
      </div>
    </div>
  </div>
);

interface FieldDisplayProps {
  name: string;
  type: SchemaType;
  required: boolean;
  description: string;
}

const FieldDisplay: React.FC<FieldDisplayProps> = ({
  name,
  type,
  required,
  description,
}) => (
  <div className="flex items-center gap-2 flex-grow">
    <span className="json-field-label font-medium">{name}</span>
    {required && (
      <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 font-medium">
        Required
      </span>
    )}
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded-md font-medium",
        getTypeColor(type),
      )}
    >
      {getTypeLabel(type)}
    </span>
    {description && (
      <span className="text-xs text-muted-foreground italic max-w-[300px] truncate">
        {description}
      </span>
    )}
  </div>
);

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
  onEdit: () => void;
  onDelete: () => void;
}

const FieldActions: React.FC<FieldActionsProps> = ({ onEdit, onDelete }) => (
  <div className="flex items-center gap-1 text-muted-foreground">
    <button
      type="button"
      onClick={onEdit}
      className="p-1 rounded-md hover:bg-secondary hover:text-foreground transition-colors"
      aria-label="Edit field"
    >
      <Edit size={16} />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors"
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
}) => (
  isEditing ? (
    <EditForm
      fieldName={fieldName}
      setFieldName={setFieldName}
      fieldType={fieldType}
      setFieldType={setFieldType}
      fieldDesc={fieldDesc}
      setFieldDesc={setFieldDesc}
      fieldRequired={fieldRequired}
      setFieldRequired={setFieldRequired}
      onSave={onSave}
      onCancel={onCancelEdit}
    />
  ) : (
    <FieldDisplay
      name={name}
      type={type}
      required={required}
      description={description}
    />
  )
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
  const [isEditing, setIsEditing] = useState(false);
  const [fieldName, setFieldName] = useState(name);
  const [fieldType, setFieldType] = useState<SchemaType>(type);
  const [fieldDesc, setFieldDesc] = useState(description);
  const [fieldRequired, setFieldRequired] = useState(required);

  const handleSave = () => {
    onEdit({
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: fieldRequired,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border border-border transition-all duration-200",
        depth > 0 && "ml-4 border-l-2",
        isNested && "mt-2",
      )}
    >
      <div className="group relative json-field-row justify-between">
        <div className="flex items-center gap-2 flex-grow">
          {children && (
            <ExpandButton
              expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            />
          )}

          <FieldContent
            isEditing={isEditing}
            fieldName={fieldName}
            setFieldName={setFieldName}
            fieldType={fieldType}
            setFieldType={setFieldType}
            fieldDesc={fieldDesc}
            setFieldDesc={setFieldDesc}
            fieldRequired={fieldRequired}
            setFieldRequired={setFieldRequired}
            onSave={handleSave}
            onCancelEdit={() => setIsEditing(false)}
            name={name}
            type={type}
            required={required}
            description={description}
          />
        </div>

        {!isEditing && (
          <FieldActions
            onEdit={() => setIsEditing(true)}
            onDelete={onDelete}
          />
        )}
      </div>

      {expanded && children && (
        <div className="pt-1 pb-2 px-2 animate-in">{children}</div>
      )}
    </div>
  );
};

export default SchemaField;
