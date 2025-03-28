import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getArrayItemsSchema } from "@/lib/schemaEditor";
import { cn } from "@/lib/utils";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "@/types/jsonSchema";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import type { TypeEditorProps } from "../TypeEditor";
import TypeEditor from "../TypeEditor";

const ArrayEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  depth = 0,
}) => {
  const [minItems, setMinItems] = useState<number | undefined>(
    typeof schema === "boolean" ? undefined : schema.minItems,
  );
  const [maxItems, setMaxItems] = useState<number | undefined>(
    typeof schema === "boolean" ? undefined : schema.maxItems,
  );
  const [uniqueItems, setUniqueItems] = useState<boolean>(
    typeof schema === "boolean" ? false : schema.uniqueItems || false,
  );

  // Get the array's item schema
  const itemsSchema = getArrayItemsSchema(schema) || { type: "string" };

  // Get the type of the array items
  const itemType =
    typeof itemsSchema === "boolean"
      ? ("string" as SchemaType)
      : ((itemsSchema.type || "string") as SchemaType);

  // Handle validation settings change
  const handleValidationChange = () => {
    const validationProps: ObjectJSONSchema = {
      type: "array",
      ...(typeof schema === "boolean" ? {} : schema),
      minItems: minItems,
      maxItems: maxItems,
      uniqueItems: uniqueItems || undefined,
    };

    // Keep the items schema
    if (validationProps.items === undefined && itemsSchema) {
      validationProps.items = itemsSchema;
    }

    // Clean up undefined values
    const propsToKeep: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validationProps)) {
      if (value !== undefined) {
        propsToKeep[key] = value;
      }
    }

    onChange(propsToKeep as ObjectJSONSchema);
  };

  // Handle item schema changes
  const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
    const updatedSchema: ObjectJSONSchema = {
      type: "array",
      ...(typeof schema === "boolean" ? {} : schema),
      items: updatedItemSchema,
    };

    onChange(updatedSchema);
  };

  // Get colors for type display
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
      case "null":
        return "text-gray-500 bg-gray-50";
    }
  };

  // Get type display label
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
      case "null":
        return "Empty";
    }
  };

  return (
    <div className="space-y-6">
      {/* Array validation settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minItems">Minimum Items</Label>
          <Input
            id="minItems"
            type="number"
            min={0}
            value={minItems ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setMinItems(value);
              // Don't update immediately to avoid too many rerenders
            }}
            onBlur={handleValidationChange}
            placeholder="No minimum"
            className="h-8"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxItems">Maximum Items</Label>
          <Input
            id="maxItems"
            type="number"
            min={0}
            value={maxItems ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              setMaxItems(value);
              // Don't update immediately to avoid too many rerenders
            }}
            onBlur={handleValidationChange}
            placeholder="No maximum"
            className="h-8"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="uniqueItems"
          checked={uniqueItems}
          onCheckedChange={(checked) => {
            setUniqueItems(checked);
            setTimeout(handleValidationChange, 0);
          }}
        />
        <Label htmlFor="uniqueItems" className="cursor-pointer">
          Force unique items
        </Label>
      </div>

      {/* Array item type editor */}
      <div className="space-y-2 pt-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
          <Label>Item Type</Label>
          <div
            className={cn(
              "text-xs px-3.5 py-1.5 rounded-md font-medium",
              getTypeColor(itemType),
            )}
          >
            {getTypeLabel(itemType)}
          </div>
        </div>

        {/* Item schema editor */}
        <div
          className={cn(
            "px-3 py-2 rounded-lg border",
            getTypeColor(itemType)
              .replace("bg-", "border-")
              .replace("50", "200/30"),
          )}
        >
          <TypeEditor
            schema={itemsSchema}
            onChange={handleItemSchemaChange}
            depth={depth + 1}
          />
        </div>
      </div>
    </div>
  );
};

export default ArrayEditor;
