import { jsx } from "react/jsx-runtime";
import react, { Suspense } from "react";
import { asObjectSchema, getSchemaDescription, withObjectSchema } from "../../types/jsonSchema.js";
import SchemaPropertyEditor from "./SchemaPropertyEditor.js";
import { useTranslation } from "../../hooks/use-translation.js";
const SchemaField = (props)=>{
    const { name, schema, required = false, onDelete, onEdit, depth = 0 } = props;
    const handleNameChange = (newName)=>{
        if (newName === name) return;
        const type = withObjectSchema(schema, (s)=>s.type || "object", "object");
        const description = getSchemaDescription(schema);
        onEdit({
            name: newName,
            type: Array.isArray(type) ? type[0] : type,
            description,
            required,
            validation: asObjectSchema(schema)
        });
    };
    const handleRequiredChange = (isRequired)=>{
        if (isRequired === required) return;
        const type = withObjectSchema(schema, (s)=>s.type || "object", "object");
        const description = getSchemaDescription(schema);
        onEdit({
            name,
            type: Array.isArray(type) ? type[0] : type,
            description,
            required: isRequired,
            validation: asObjectSchema(schema)
        });
    };
    const handleSchemaChange = (newSchema)=>{
        const type = newSchema.type || "object";
        const description = newSchema.description || "";
        onEdit({
            name,
            type: Array.isArray(type) ? type[0] : type,
            description,
            required,
            validation: newSchema
        });
    };
    return /*#__PURE__*/ jsx(SchemaPropertyEditor, {
        name: name,
        schema: schema,
        required: required,
        onDelete: onDelete,
        onNameChange: handleNameChange,
        onRequiredChange: handleRequiredChange,
        onSchemaChange: handleSchemaChange,
        depth: depth
    });
};
const SchemaEditor_SchemaField = SchemaField;
const ExpandButton = ({ expanded, onClick })=>{
    const t = useTranslation();
    const ChevronDown = /*#__PURE__*/ react.lazy(()=>import("lucide-react").then((mod)=>({
                default: mod.ChevronDown
            })));
    const ChevronRight = /*#__PURE__*/ react.lazy(()=>import("lucide-react").then((mod)=>({
                default: mod.ChevronRight
            })));
    return /*#__PURE__*/ jsx("button", {
        type: "button",
        className: "text-muted-foreground hover:text-foreground transition-colors",
        onClick: onClick,
        "aria-label": expanded ? t.collapse : t.expand,
        children: /*#__PURE__*/ jsx(Suspense, {
            fallback: /*#__PURE__*/ jsx("div", {
                className: "w-[18px] h-[18px]"
            }),
            children: expanded ? /*#__PURE__*/ jsx(ChevronDown, {
                size: 18
            }) : /*#__PURE__*/ jsx(ChevronRight, {
                size: 18
            })
        })
    });
};
const FieldActions = ({ onDelete })=>{
    const t = useTranslation();
    const X = /*#__PURE__*/ react.lazy(()=>import("lucide-react").then((mod)=>({
                default: mod.X
            })));
    return /*#__PURE__*/ jsx("div", {
        className: "flex items-center gap-1 text-muted-foreground",
        children: /*#__PURE__*/ jsx("button", {
            type: "button",
            onClick: onDelete,
            className: "p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100",
            "aria-label": t.fieldDelete,
            children: /*#__PURE__*/ jsx(Suspense, {
                fallback: /*#__PURE__*/ jsx("div", {
                    className: "w-[16px] h-[16px]"
                }),
                children: /*#__PURE__*/ jsx(X, {
                    size: 16
                })
            })
        })
    });
};
export { ExpandButton, FieldActions, SchemaEditor_SchemaField as default };
