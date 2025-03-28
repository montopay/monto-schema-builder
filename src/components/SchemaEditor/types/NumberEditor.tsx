import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { JSONSchema, ObjectJSONSchema } from "@/types/jsonSchema";
import { isBooleanSchema, withObjectSchema } from "@/types/jsonSchema";
import { X } from "lucide-react";
import { useState } from "react";
import type { TypeEditorProps } from "../TypeEditor";

interface NumberEditorProps extends TypeEditorProps {
  integer?: boolean;
}

// Helper function to set properties without TypeScript errors
function setSchemaProperty(
  schema: ObjectJSONSchema,
  key: string,
  value: unknown,
): ObjectJSONSchema {
  return {
    ...schema,
    [key]: value,
  };
}

const NumberEditor: React.FC<NumberEditorProps> = ({
  schema,
  onChange,
  integer = false,
}) => {
  const [enumValue, setEnumValue] = useState("");

  // Extract number-specific validations
  const minimum = withObjectSchema(schema, (s) => s.minimum, undefined);
  const maximum = withObjectSchema(schema, (s) => s.maximum, undefined);
  const exclusiveMinimum = withObjectSchema(
    schema,
    (s) => s.exclusiveMinimum,
    undefined,
  );
  const exclusiveMaximum = withObjectSchema(
    schema,
    (s) => s.exclusiveMaximum,
    undefined,
  );
  const multipleOf = withObjectSchema(schema, (s) => s.multipleOf, undefined);
  const enumValues = withObjectSchema(
    schema,
    (s) => (s.enum as number[]) || [],
    [],
  );

  // Handle validation change
  const handleValidationChange = (property: string, value: unknown) => {
    // Create a safe base schema with necessary properties
    const baseProperties: Partial<ObjectJSONSchema> = {
      type: integer ? "integer" : "number",
    };

    // Copy existing validation properties (except type and description) if schema is an object
    if (!isBooleanSchema(schema)) {
      if (schema.minimum !== undefined) baseProperties.minimum = schema.minimum;
      if (schema.maximum !== undefined) baseProperties.maximum = schema.maximum;
      if (schema.exclusiveMinimum !== undefined)
        baseProperties.exclusiveMinimum = schema.exclusiveMinimum;
      if (schema.exclusiveMaximum !== undefined)
        baseProperties.exclusiveMaximum = schema.exclusiveMaximum;
      if (schema.multipleOf !== undefined)
        baseProperties.multipleOf = schema.multipleOf;
      if (schema.enum !== undefined) baseProperties.enum = schema.enum;
    }

    // Only add the property if the value is defined, otherwise remove it
    if (value !== undefined) {
      // Create updated object with modified property
      const updatedProperties: Partial<ObjectJSONSchema> = {
        ...baseProperties,
      };

      if (property === "minimum") updatedProperties.minimum = value as number;
      else if (property === "maximum")
        updatedProperties.maximum = value as number;
      else if (property === "exclusiveMinimum")
        updatedProperties.exclusiveMinimum = value as number;
      else if (property === "exclusiveMaximum")
        updatedProperties.exclusiveMaximum = value as number;
      else if (property === "multipleOf")
        updatedProperties.multipleOf = value as number;
      else if (property === "enum") updatedProperties.enum = value as unknown[];

      onChange(updatedProperties as ObjectJSONSchema);
      return;
    }

    // Handle removing a property (value is undefined)
    if (property === "minimum") {
      const { minimum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "maximum") {
      const { maximum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "exclusiveMinimum") {
      const { exclusiveMinimum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "exclusiveMaximum") {
      const { exclusiveMaximum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "multipleOf") {
      const { multipleOf: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "enum") {
      const { enum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    // Fallback case - just use the base properties
    onChange(baseProperties as ObjectJSONSchema);
  };

  // Handle adding enum value
  const handleAddEnumValue = () => {
    if (!enumValue.trim()) return;

    const numValue = Number(enumValue);
    if (Number.isNaN(numValue)) return;

    // For integer type, ensure the value is an integer
    const validValue = integer ? Math.floor(numValue) : numValue;

    if (!enumValues.includes(validValue)) {
      handleValidationChange("enum", [...enumValues, validValue]);
    }

    setEnumValue("");
  };

  // Handle removing enum value
  const handleRemoveEnumValue = (index: number) => {
    const newEnumValues = [...enumValues];
    newEnumValues.splice(index, 1);

    if (newEnumValues.length === 0) {
      // If empty, remove the enum property entirely by setting it to undefined
      handleValidationChange("enum", undefined);
    } else {
      handleValidationChange("enum", newEnumValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimum">Minimum Value</Label>
          <Input
            id="minimum"
            type="number"
            value={minimum ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("minimum", value);
            }}
            placeholder="No minimum"
            className="h-8"
            step={integer ? 1 : "any"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximum">Maximum Value</Label>
          <Input
            id="maximum"
            type="number"
            value={maximum ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("maximum", value);
            }}
            placeholder="No maximum"
            className="h-8"
            step={integer ? 1 : "any"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exclusiveMinimum">Exclusive Minimum</Label>
          <Input
            id="exclusiveMinimum"
            type="number"
            value={exclusiveMinimum ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("exclusiveMinimum", value);
            }}
            placeholder="No exclusive min"
            className="h-8"
            step={integer ? 1 : "any"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclusiveMaximum">Exclusive Maximum</Label>
          <Input
            id="exclusiveMaximum"
            type="number"
            value={exclusiveMaximum ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              handleValidationChange("exclusiveMaximum", value);
            }}
            placeholder="No exclusive max"
            className="h-8"
            step={integer ? 1 : "any"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="multipleOf">Multiple Of</Label>
        <Input
          id="multipleOf"
          type="number"
          value={multipleOf ?? ""}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined;
            handleValidationChange("multipleOf", value);
          }}
          placeholder="Any"
          className="h-8"
          min={0}
          step={integer ? 1 : "any"}
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-border/40">
        <Label>Allowed Values (enum)</Label>

        <div className="flex flex-wrap gap-2 mb-4">
          {enumValues.length > 0 ? (
            enumValues.map((value, index) => (
              <div
                key={`enum-number-${value}`}
                className="flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs"
              >
                <span className="mr-1">{value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEnumValue(index)}
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
            type="number"
            value={enumValue}
            onChange={(e) => setEnumValue(e.target.value)}
            placeholder="Add allowed value..."
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddEnumValue()}
            step={integer ? 1 : "any"}
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

export default NumberEditor;
