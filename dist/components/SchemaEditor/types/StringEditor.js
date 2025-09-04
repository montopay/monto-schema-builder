import { jsx, jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
import { useId, useState } from "react";
import { Input } from "../../ui/input.js";
import { Label } from "../../ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select.js";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.js";
import { useTranslation } from "../../../hooks/use-translation.js";
const StringEditor_StringEditor = ({ schema, onChange })=>{
    const t = useTranslation();
    const [enumValue, setEnumValue] = useState("");
    const minLengthId = useId();
    const maxLengthId = useId();
    const patternId = useId();
    const formatId = useId();
    const minLength = withObjectSchema(schema, (s)=>s.minLength, void 0);
    const maxLength = withObjectSchema(schema, (s)=>s.maxLength, void 0);
    const pattern = withObjectSchema(schema, (s)=>s.pattern, void 0);
    const format = withObjectSchema(schema, (s)=>s.format, void 0);
    const enumValues = withObjectSchema(schema, (s)=>s.enum || [], []);
    const handleValidationChange = (property, value)=>{
        const baseSchema = isBooleanSchema(schema) ? {
            type: "string"
        } : {
            ...schema
        };
        const { type: _, description: __, ...validationProps } = baseSchema;
        const updatedValidation = {
            ...validationProps,
            type: "string",
            [property]: value
        };
        onChange(updatedValidation);
    };
    const handleAddEnumValue = ()=>{
        if (!enumValue.trim()) return;
        if (!enumValues.includes(enumValue)) handleValidationChange("enum", [
            ...enumValues,
            enumValue
        ]);
        setEnumValue("");
    };
    const handleRemoveEnumValue = (index)=>{
        const newEnumValues = [
            ...enumValues
        ];
        newEnumValues.splice(index, 1);
        if (0 === newEnumValues.length) {
            const baseSchema = isBooleanSchema(schema) ? {
                type: "string"
            } : {
                ...schema
            };
            if (!isBooleanSchema(baseSchema) && "enum" in baseSchema) {
                const { enum: _, ...rest } = baseSchema;
                onChange(rest);
            } else onChange(baseSchema);
        } else handleValidationChange("enum", newEnumValues);
    };
    return /*#__PURE__*/ jsxs("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ jsxs("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ jsx(Label, {
                                htmlFor: minLengthId,
                                children: t.stringMinimumLengthLabel
                            }),
                            /*#__PURE__*/ jsx(Input, {
                                id: minLengthId,
                                type: "number",
                                min: 0,
                                value: minLength ?? "",
                                onChange: (e)=>{
                                    const value = e.target.value ? Number(e.target.value) : void 0;
                                    handleValidationChange("minLength", value);
                                },
                                placeholder: t.stringMinimumLengthPlaceholder,
                                className: "h-8"
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsxs("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ jsx(Label, {
                                htmlFor: maxLengthId,
                                children: t.stringMaximumLengthLabel
                            }),
                            /*#__PURE__*/ jsx(Input, {
                                id: maxLengthId,
                                type: "number",
                                min: 0,
                                value: maxLength ?? "",
                                onChange: (e)=>{
                                    const value = e.target.value ? Number(e.target.value) : void 0;
                                    handleValidationChange("maxLength", value);
                                },
                                placeholder: t.stringMaximumLengthPlaceholder,
                                className: "h-8"
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ jsx(Label, {
                        htmlFor: patternId,
                        children: t.stringPatternLabel
                    }),
                    /*#__PURE__*/ jsx(Input, {
                        id: patternId,
                        type: "text",
                        value: pattern ?? "",
                        onChange: (e)=>{
                            const value = e.target.value || void 0;
                            handleValidationChange("pattern", value);
                        },
                        placeholder: t.stringPatternPlaceholder,
                        className: "h-8"
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ jsx(Label, {
                        htmlFor: formatId,
                        children: t.stringFormatLabel
                    }),
                    /*#__PURE__*/ jsxs(Select, {
                        value: format || "none",
                        onValueChange: (value)=>{
                            handleValidationChange("format", "none" === value ? void 0 : value);
                        },
                        children: [
                            /*#__PURE__*/ jsx(SelectTrigger, {
                                id: formatId,
                                className: "h-8",
                                children: /*#__PURE__*/ jsx(SelectValue, {
                                    placeholder: "Select format"
                                })
                            }),
                            /*#__PURE__*/ jsxs(SelectContent, {
                                children: [
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "none",
                                        children: t.stringFormatNone
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "date-time",
                                        children: t.stringFormatDateTime
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "date",
                                        children: t.stringFormatDate
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "time",
                                        children: t.stringFormatTime
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "email",
                                        children: t.stringFormatEmail
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "uri",
                                        children: t.stringFormatUri
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "uuid",
                                        children: t.stringFormatUuid
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "hostname",
                                        children: t.stringFormatHostname
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "ipv4",
                                        children: t.stringFormatIpv4
                                    }),
                                    /*#__PURE__*/ jsx(SelectItem, {
                                        value: "ipv6",
                                        children: t.stringFormatIpv6
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ jsxs("div", {
                className: "space-y-2 pt-2 border-t border-border/40",
                children: [
                    /*#__PURE__*/ jsx(Label, {
                        children: t.stringAllowedValuesEnumLabel
                    }),
                    /*#__PURE__*/ jsx("div", {
                        className: "flex flex-wrap gap-2 mb-4",
                        children: enumValues.length > 0 ? enumValues.map((value)=>/*#__PURE__*/ jsxs("div", {
                                className: "flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs",
                                children: [
                                    /*#__PURE__*/ jsx("span", {
                                        className: "mr-1",
                                        children: value
                                    }),
                                    /*#__PURE__*/ jsx("button", {
                                        type: "button",
                                        onClick: ()=>handleRemoveEnumValue(enumValues.indexOf(value)),
                                        className: "text-muted-foreground hover:text-destructive",
                                        children: /*#__PURE__*/ jsx(X, {
                                            size: 12
                                        })
                                    })
                                ]
                            }, `enum-string-${value}`)) : /*#__PURE__*/ jsx("p", {
                            className: "text-xs text-muted-foreground italic",
                            children: t.stringAllowedValuesEnumNone
                        })
                    }),
                    /*#__PURE__*/ jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ jsx(Input, {
                                type: "text",
                                value: enumValue,
                                onChange: (e)=>setEnumValue(e.target.value),
                                placeholder: t.stringAllowedValuesEnumAddPlaceholder,
                                className: "h-8 text-xs flex-1",
                                onKeyDown: (e)=>"Enter" === e.key && handleAddEnumValue()
                            }),
                            /*#__PURE__*/ jsx("button", {
                                type: "button",
                                onClick: handleAddEnumValue,
                                className: "px-3 py-1 h-8 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80",
                                children: "Add"
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
const StringEditor = StringEditor_StringEditor;
export { StringEditor as default };
