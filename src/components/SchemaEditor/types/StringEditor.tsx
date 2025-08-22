import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.ts";
import { X } from "lucide-react";
import { useState } from "react";
import type { TypeEditorProps } from "../TypeEditor.tsx";

const StringEditor: React.FC<TypeEditorProps> = ({ schema, onChange }) => {
  const [enumValue, setEnumValue] = useState("");

  // Extract string-specific validations
  const minLength = withObjectSchema(schema, (s) => s.minLength, undefined);
  const maxLength = withObjectSchema(schema, (s) => s.maxLength, undefined);
  const pattern = withObjectSchema(schema, (s) => s.pattern, undefined);
  const format = withObjectSchema(schema, (s) => s.format, undefined);
  const enumValues = withObjectSchema(
    schema,
    (s) => (s.enum as string[]) || [],
    [],
  );

  // Handle validation change
  const handleValidationChange = (property: string, value: unknown) => {
    // Create a safe base schema
    const baseSchema = isBooleanSchema(schema)
      ? { type: "string" as const }
      : { ...schema };

    // Get all validation props except type and description
    const { type: _, description: __, ...validationProps } = baseSchema;

    // Create the updated validation schema
    const updatedValidation: ObjectJSONSchema = {
      ...validationProps,
      type: "string",
      [property]: value,
    };

    onChange(updatedValidation);
  };

  // Handle adding enum value
  const handleAddEnumValue = () => {
    if (!enumValue.trim()) return;

    if (!enumValues.includes(enumValue)) {
      handleValidationChange("enum", [...enumValues, enumValue]);
    }

    setEnumValue("");
  };

  // Handle removing enum value
  const handleRemoveEnumValue = (index: number) => {
    const newEnumValues = [...enumValues];
    newEnumValues.splice(index, 1);

    if (newEnumValues.length === 0) {
      // If empty, remove the enum property entirely
      const baseSchema = isBooleanSchema(schema)
        ? { type: "string" as const }
        : { ...schema };

      // Use a type safe approach
      if (!isBooleanSchema(baseSchema) && "enum" in baseSchema) {
        const { enum: _, ...rest } = baseSchema;
        onChange(rest as ObjectJSONSchema);
      } else {
        onChange(baseSchema as ObjectJSONSchema);
      }
    } else {
      handleValidationChange("enum", newEnumValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minLength">Minimum Length</Label>
          <Input
            id="minLength"
            type="number"
            min={0}
            value={minLength ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("minLength", value);
            }}
            placeholder="No minimum"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxLength">Maximum Length</Label>
          <Input
            id="maxLength"
            type="number"
            min={0}
            value={maxLength ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("maxLength", value);
            }}
            placeholder="No maximum"
            className="h-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern">Pattern (regex)</Label>
        <Input
          id="pattern"
          type="text"
          value={pattern ?? ""}
          onChange={(e) => {
            const value = e.target.value || undefined;
            handleValidationChange("pattern", value);
          }}
          placeholder="^[a-zA-Z]+$"
          className="h-8"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Select
          value={format || "none"}
          onValueChange={(value) => {
            handleValidationChange(
              "format",
              value === "none" ? undefined : value,
            );
          }}
        >
          <SelectTrigger id="format" className="h-8">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="date-time">Date-Time</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="time">Time</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="uri">URI</SelectItem>
            <SelectItem value="uuid">UUID</SelectItem>
            <SelectItem value="hostname">Hostname</SelectItem>
            <SelectItem value="ipv4">IPv4</SelectItem>
            <SelectItem value="ipv6">IPv6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/40">
        <Label>Allowed Values (enum)</Label>

        <div className="flex flex-wrap gap-2 mb-4">
          {enumValues.length > 0 ? (
            enumValues.map((value) => (
              <div
                key={`enum-string-${value}`}
                className="flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs"
              >
                <span className="mr-1">{value}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveEnumValue(enumValues.indexOf(value))
                  }
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No restricted values set
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={enumValue}
            onChange={(e) => setEnumValue(e.target.value)}
            placeholder="Add allowed value..."
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddEnumValue()}
          />
          <button
            type="button"
            onClick={handleAddEnumValue}
            className="px-3 py-1 h-8 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default StringEditor;
