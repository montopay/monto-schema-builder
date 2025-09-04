import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "../../lib/utils.js";
import { useTranslation } from "../../hooks/use-translation.js";
const typeOptions = [
    {
        id: "string",
        label: "fieldTypeTextLabel",
        description: "fieldTypeTextDescription"
    },
    {
        id: "number",
        label: "fieldTypeNumberLabel",
        description: "fieldTypeNumberDescription"
    },
    {
        id: "boolean",
        label: "fieldTypeBooleanLabel",
        description: "fieldTypeBooleanDescription"
    },
    {
        id: "object",
        label: "fieldTypeObjectLabel",
        description: "fieldTypeObjectDescription"
    },
    {
        id: "array",
        label: "fieldTypeArrayLabel",
        description: "fieldTypeArrayDescription"
    }
];
const SchemaTypeSelector_SchemaTypeSelector = ({ id, value, onChange })=>{
    const t = useTranslation();
    return /*#__PURE__*/ jsx("div", {
        id: id,
        className: "grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2",
        children: typeOptions.map((type)=>/*#__PURE__*/ jsxs("button", {
                type: "button",
                title: t[type.description],
                className: cn("p-2.5 rounded-lg border-2 text-left transition-all duration-200", value === type.id ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:border-primary/30 hover:bg-secondary"),
                onClick: ()=>onChange(type.id),
                children: [
                    /*#__PURE__*/ jsx("div", {
                        className: "font-medium text-sm",
                        children: t[type.label]
                    }),
                    /*#__PURE__*/ jsx("div", {
                        className: "text-xs text-muted-foreground line-clamp-1",
                        children: t[type.description]
                    })
                ]
            }, type.id))
    });
};
const SchemaTypeSelector = SchemaTypeSelector_SchemaTypeSelector;
export { SchemaTypeSelector as default };
