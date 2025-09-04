import { jsx, jsxs } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Input } from "../../ui/input.js";
import { Label } from "../../ui/label.js";
import { Switch } from "../../ui/switch.js";
import { getArrayItemsSchema } from "../../../lib/schemaEditor.js";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.js";
import TypeDropdown from "../TypeDropdown.js";
import TypeEditor from "../TypeEditor.js";
import { useTranslation } from "../../../hooks/use-translation.js";
const ArrayEditor_ArrayEditor = ({ schema, onChange, depth = 0 })=>{
    const t = useTranslation();
    const [minItems, setMinItems] = useState(withObjectSchema(schema, (s)=>s.minItems, void 0));
    const [maxItems, setMaxItems] = useState(withObjectSchema(schema, (s)=>s.maxItems, void 0));
    const [uniqueItems, setUniqueItems] = useState(withObjectSchema(schema, (s)=>s.uniqueItems || false, false));
    const minItemsId = useId();
    const maxItemsId = useId();
    const uniqueItemsId = useId();
    const itemsSchema = getArrayItemsSchema(schema) || {
        type: "string"
    };
    const itemType = withObjectSchema(itemsSchema, (s)=>s.type || "string", "string");
    const handleValidationChange = ()=>{
        const validationProps = {
            type: "array",
            ...isBooleanSchema(schema) ? {} : schema,
            minItems: minItems,
            maxItems: maxItems,
            uniqueItems: uniqueItems || void 0
        };
        if (void 0 === validationProps.items && itemsSchema) validationProps.items = itemsSchema;
        const propsToKeep = {};
        for (const [key, value] of Object.entries(validationProps))if (void 0 !== value) propsToKeep[key] = value;
        onChange(propsToKeep);
    };
    const handleItemSchemaChange = (updatedItemSchema)=>{
        const updatedSchema = {
            type: "array",
            ...isBooleanSchema(schema) ? {} : schema,
            items: updatedItemSchema
        };
        onChange(updatedSchema);
    };
    return /*#__PURE__*/ jsxs("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ jsxs("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ jsx(Label, {
                                htmlFor: minItemsId,
                                children: t.arrayMinimumLabel
                            }),
                            /*#__PURE__*/ jsx(Input, {
                                id: minItemsId,
                                type: "number",
                                min: 0,
                                value: minItems ?? "",
                                onChange: (e)=>{
                                    const value = e.target.value ? Number(e.target.value) : void 0;
                                    setMinItems(value);
                                },
                                onBlur: handleValidationChange,
                                placeholder: t.arrayMinimumPlaceholder,
                                className: "h-8"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsxs("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ jsx(Label, {
                                htmlFor: maxItemsId,
                                children: t.arrayMaximumLabel
                            }),
                            /*#__PURE__*/ jsx(Input, {
                                id: maxItemsId,
                                type: "number",
                                min: 0,
                                value: maxItems ?? "",
                                onChange: (e)=>{
                                    const value = e.target.value ? Number(e.target.value) : void 0;
                                    setMaxItems(value);
                                },
                                onBlur: handleValidationChange,
                                placeholder: t.arrayMaximumPlaceholder,
                                className: "h-8"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                    /*#__PURE__*/ jsx(Switch, {
                        id: uniqueItemsId,
                        checked: uniqueItems,
                        onCheckedChange: (checked)=>{
                            setUniqueItems(checked);
                            setTimeout(handleValidationChange, 0);
                        }
                    }),
                    /*#__PURE__*/ jsx(Label, {
                        htmlFor: uniqueItemsId,
                        className: "cursor-pointer",
                        children: t.arrayForceUniqueItemsLabel
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("div", {
                className: "space-y-2 pt-4 border-t border-border/40",
                children: [
                    /*#__PURE__*/ jsxs("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                            /*#__PURE__*/ jsx(Label, {
                                children: t.arrayItemTypeLabel
                            }),
                            /*#__PURE__*/ jsx(TypeDropdown, {
                                value: itemType,
                                onChange: (newType)=>{
                                    handleItemSchemaChange({
                                        ...withObjectSchema(itemsSchema, (s)=>s, {}),
                                        type: newType
                                    });
                                }
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx(TypeEditor, {
                        schema: itemsSchema,
                        onChange: handleItemSchemaChange,
                        depth: depth + 1
                    })
                ]
            })
        ]
    });
};
const ArrayEditor = ArrayEditor_ArrayEditor;
export { ArrayEditor as default };
