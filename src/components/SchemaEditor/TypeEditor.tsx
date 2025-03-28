import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "@/types/jsonSchema";
import { Suspense, lazy } from "react";

// Lazy load specific type editors to avoid circular dependencies
const StringEditor = lazy(() => import("./types/StringEditor.tsx"));
const NumberEditor = lazy(() => import("./types/NumberEditor.tsx"));
const BooleanEditor = lazy(() => import("./types/BooleanEditor.tsx"));
const ObjectEditor = lazy(() => import("./types/ObjectEditor.tsx"));
const ArrayEditor = lazy(() => import("./types/ArrayEditor.tsx"));

export interface TypeEditorProps {
  schema: JSONSchema;
  onChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

const TypeEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  depth = 0,
}) => {
  const type =
    typeof schema === "boolean"
      ? "string"
      : ((schema.type || "object") as SchemaType);

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      {type === "string" && (
        <StringEditor schema={schema} onChange={onChange} depth={depth} />
      )}
      {type === "number" && (
        <NumberEditor schema={schema} onChange={onChange} depth={depth} />
      )}
      {type === "integer" && (
        <NumberEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          integer
        />
      )}
      {type === "boolean" && (
        <BooleanEditor schema={schema} onChange={onChange} depth={depth} />
      )}
      {type === "object" && (
        <ObjectEditor schema={schema} onChange={onChange} depth={depth} />
      )}
      {type === "array" && (
        <ArrayEditor schema={schema} onChange={onChange} depth={depth} />
      )}
    </Suspense>
  );
};

export default TypeEditor;
