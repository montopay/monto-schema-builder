import { cn } from "@/lib/utils";
import type { JSONSchema, NewField, SchemaType } from "@/types/jsonSchema";
import { useState } from "react";
import { ExpandButton, FieldActions, FieldDisplay } from "../SchemaField";
import { X } from "lucide-react";

interface PrimitiveSchemaFieldProps {
  name: string;
  schema: JSONSchema;
  required?: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const PrimitiveSchemaField: React.FC<PrimitiveSchemaFieldProps> = ({
  name,
  schema,
  required = false,
  onDelete,
  onEdit,
  isNested = false,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [fieldName, setFieldName] = useState(name);
  const [enumValue, setEnumValue] = useState("");
  const type =
    typeof schema === "boolean"
      ? "string" // Default to string for boolean schemas
      : ((schema.type || "string") as SchemaType);
  const description =
    typeof schema === "boolean" ? "" : schema.description || "";

  const handleFieldChange = (changes: Partial<NewField>) => {
    const newField = {
      name: fieldName,
      type,
      description,
      required,
      ...changes,
    };
    setFieldName(newField.name);
    onEdit(newField);
  };

  const handleValidationChange = (property: string, value: unknown) => {
    // Get current validation
    const currentValidation =
      typeof schema === "boolean" ? {} : { ...schema };
      
    // Update validation property
    const validation = {
      ...currentValidation,
      [property]: value,
    };
    
    // Clone without type and description as they're handled separately
    const { type: _, description: __, ...validationProps } = validation;
    
    handleFieldChange({ validation: validationProps });
  };

  const getEnumValues = (): unknown[] => {
    if (typeof schema === "boolean" || !schema.enum) {
      return [];
    }
    return schema.enum;
  };

  const handleAddEnumValue = () => {
    if (!enumValue.trim()) return;
    
    const enumValues = getEnumValues();
    
    let typedValue: unknown = enumValue;
    // Convert to appropriate type
    if (type === "number" || type === "integer") {
      typedValue = Number.parseFloat(enumValue);
      if (Number.isNaN(typedValue)) return;
    } else if (type === "boolean") {
      typedValue = enumValue === "true";
    }
    
    // Add only if not already in the list
    if (!enumValues.some(v => v === typedValue)) {
      handleValidationChange("enum", [...enumValues, typedValue]);
    }
    
    setEnumValue("");
  };

  const handleRemoveEnumValue = (index: number) => {
    const enumValues = getEnumValues();
    const newEnumValues = [...enumValues];
    newEnumValues.splice(index, 1);
    
    if (newEnumValues.length === 0) {
      // If empty, remove the enum property entirely
      const currentValidation =
        typeof schema === "boolean" ? {} : { ...schema };
      const { enum: _, type: __, description: ___, ...rest } = currentValidation;
      handleFieldChange({ validation: rest });
    } else {
      handleValidationChange("enum", newEnumValues);
    }
  };

  const renderValidationFields = () => {
    if (!expanded) return null;

    return (
      <div className="pt-1 pb-2 px-2 sm:px-3 animate-in space-y-3">
        {/* Type-specific validation fields */}
        {type === "string" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <ValidationField
                label="Min Length"
                type="number"
                value={typeof schema !== "boolean" ? schema.minLength : undefined}
                onChange={(value) => handleValidationChange("minLength", value)}
                placeholder="0"
              />
              <ValidationField
                label="Max Length" 
                type="number"
                value={typeof schema !== "boolean" ? schema.maxLength : undefined}
                onChange={(value) => handleValidationChange("maxLength", value)}
                placeholder="∞"
              />
            </div>
            <ValidationField
              label="Pattern (regex)"
              type="text" 
              value={typeof schema !== "boolean" ? schema.pattern : undefined}
              onChange={(value) => handleValidationChange("pattern", value)}
              placeholder="^[a-zA-Z]+$"
              fullWidth
            />
            <ValidationField
              label="Format"
              type="select"
              options={["", "date-time", "date", "time", "email", "uri", "uuid"]}
              value={typeof schema !== "boolean" ? schema.format : undefined}
              onChange={(value) => handleValidationChange("format", value)}
              fullWidth
            />
          </div>
        )}

        {(type === "number" || type === "integer") && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <ValidationField
                label="Minimum"
                type="number"
                value={typeof schema !== "boolean" ? schema.minimum : undefined}
                onChange={(value) => handleValidationChange("minimum", value)}
                placeholder="-∞"
              />
              <ValidationField
                label="Maximum"
                type="number"
                value={typeof schema !== "boolean" ? schema.maximum : undefined}
                onChange={(value) => handleValidationChange("maximum", value)}
                placeholder="∞"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ValidationField
                label="Exclusive Min"
                type="number"
                value={typeof schema !== "boolean" ? schema.exclusiveMinimum : undefined}
                onChange={(value) => handleValidationChange("exclusiveMinimum", value)}
                placeholder="-∞"
              />
              <ValidationField
                label="Exclusive Max"
                type="number"
                value={typeof schema !== "boolean" ? schema.exclusiveMaximum : undefined}
                onChange={(value) => handleValidationChange("exclusiveMaximum", value)}
                placeholder="∞"
              />
            </div>
            <ValidationField
              label="Multiple Of"
              type="number"
              value={typeof schema !== "boolean" ? schema.multipleOf : undefined}
              onChange={(value) => handleValidationChange("multipleOf", value)}
              placeholder="Any"
              fullWidth
            />
          </div>
        )}

        {/* Enum values section for all types */}
        <div className="mt-2 pt-2 border-t border-border/30">
          <div className="text-xs font-medium mb-2 text-muted-foreground">Allowed Values (enum)</div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {getEnumValues().map((value, index) => (
              <div key={`enum-${typeof value}-${String(value)}-${index}`} className="flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs">
                <span className="mr-1">{String(value)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEnumValue(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {getEnumValues().length === 0 && (
              <p className="text-xs text-muted-foreground italic">No restricted values set</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type={type === "number" || type === "integer" ? "number" : "text"}
              value={enumValue}
              onChange={(e) => setEnumValue(e.target.value)}
              placeholder={`Add ${type} value...`}
              className="flex-1 h-8 rounded-md border border-input px-3 py-1 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleAddEnumValue()}
            />
            <button
              type="button"
              onClick={handleAddEnumValue}
              className="px-2 py-1 h-8 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border transition-all duration-200",
        depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
        isNested && "mt-2",
      )}
    >
      <div className="relative json-field-row justify-between group">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <ExpandButton
            expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          />

          <FieldDisplay
            name={fieldName}
            schema={schema}
            required={required || false}
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

      {renderValidationFields()}
    </div>
  );
};

// Helper component for validation fields
interface ValidationFieldProps {
  label: string;
  type: "text" | "number" | "select";
  value?: unknown;
  onChange: (value: unknown) => void;
  placeholder?: string;
  fullWidth?: boolean;
  options?: string[];
}

const ValidationField: React.FC<ValidationFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  fullWidth = false,
  options = [],
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    
    if (type === "number") {
      // Empty string means remove the property
      if (newValue === "") {
        onChange(undefined);
        return;
      }
      onChange(Number.parseFloat(newValue));
    } else if (type === "select" && newValue === "") {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };

  const fieldId = `validation-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={cn("flex flex-col", fullWidth ? "col-span-2" : "")}>
      <label htmlFor={fieldId} className="text-xs font-medium mb-1 text-muted-foreground">
        {label}
      </label>
      {type === "select" ? (
        <select
          id={fieldId}
          value={value === undefined ? "" : String(value)}
          onChange={handleChange}
          className="h-8 rounded-md border border-input px-3 py-1 text-xs bg-background"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === "" ? placeholder : option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value === undefined ? "" : String(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className="h-8 rounded-md border border-input px-3 py-1 text-xs"
        />
      )}
    </div>
  );
};

export default PrimitiveSchemaField;
