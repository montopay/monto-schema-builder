import React, { useState } from "react";
import { Edit, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SchemaFieldProps {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  children?: React.ReactNode;
  onDelete: () => void;
  onEdit: (field: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }) => void;
  isNested?: boolean;
  depth?: number;
}

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
  const [fieldType, setFieldType] = useState(type);
  const [fieldDesc, setFieldDesc] = useState(description);
  const [fieldRequired, setFieldRequired] = useState(required);

  const isPrimitive =
    type === "string" || type === "number" || type === "boolean";
  const hasChildren = !!children && !isPrimitive;

  const handleSave = () => {
    onEdit({
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: fieldRequired,
    });
    setIsEditing(false);
  };

  const getTypeColor = (type: string) => {
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
      default:
        return "text-gray-500 bg-gray-50";
    }
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
          {hasChildren && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}

          {isEditing ? (
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
                  onChange={(e) => setFieldType(e.target.value)}
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
                    onClick={() => setIsEditing(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} className="h-8">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Field display for all types */}
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
                  {type === "string"
                    ? "Text"
                    : type === "number"
                      ? "Number"
                      : type === "boolean"
                        ? "Yes/No"
                        : type === "object"
                          ? "Group"
                          : type === "array"
                            ? "List"
                            : type}
                </span>
                {description && (
                  <span className="text-xs text-muted-foreground italic max-w-[300px] truncate">
                    {description}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Edit field"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors"
              aria-label="Delete field"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="pt-1 pb-2 px-2 animate-in">{children}</div>
      )}
    </div>
  );
};

export default SchemaField;
