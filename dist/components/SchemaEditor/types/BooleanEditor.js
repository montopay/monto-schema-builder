import { jsx, jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { Label } from "../../ui/label.js";
import { Switch } from "../../ui/switch.js";
import { withObjectSchema } from "../../../types/jsonSchema.js";
import { useTranslation } from "../../../hooks/use-translation.js";
const BooleanEditor_BooleanEditor = ({ schema, onChange })=>{
    const t = useTranslation();
    const allowTrueId = useId();
    const allowFalseId = useId();
    const enumValues = withObjectSchema(schema, (s)=>s.enum, null);
    const hasRestrictions = Array.isArray(enumValues);
    const allowsTrue = !hasRestrictions || enumValues?.includes(true) || false;
    const allowsFalse = !hasRestrictions || enumValues?.includes(false) || false;
    const handleAllowedChange = (value, allowed)=>{
        let newEnum;
        if (allowed) {
            if (!hasRestrictions) return;
            if (enumValues?.includes(value)) return;
            newEnum = enumValues ? [
                ...enumValues,
                value
            ] : [
                value
            ];
            if (newEnum.includes(true) && newEnum.includes(false)) newEnum = void 0;
        } else {
            if (hasRestrictions && !enumValues?.includes(value)) return;
            newEnum = [
                !value
            ];
        }
        const updatedValidation = {
            type: "boolean"
        };
        if (!newEnum) return void onChange({
            type: "boolean"
        });
        updatedValidation.enum = newEnum;
        onChange(updatedValidation);
    };
    return /*#__PURE__*/ jsx("div", {
        className: "space-y-4",
        children: /*#__PURE__*/ jsxs("div", {
            className: "space-y-2 pt-2",
            children: [
                /*#__PURE__*/ jsx(Label, {
                    children: "Allowed Values"
                }),
                /*#__PURE__*/ jsxs("div", {
                    className: "space-y-3",
                    children: [
                        /*#__PURE__*/ jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                                /*#__PURE__*/ jsx(Switch, {
                                    id: allowTrueId,
                                    checked: allowsTrue,
                                    onCheckedChange: (checked)=>handleAllowedChange(true, checked)
                                }),
                                /*#__PURE__*/ jsx(Label, {
                                    htmlFor: allowTrueId,
                                    className: "cursor-pointer",
                                    children: t.booleanAllowTrueLabel
                                })
                            ]
                        }),
                        /*#__PURE__*/ jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                                /*#__PURE__*/ jsx(Switch, {
                                    id: allowFalseId,
                                    checked: allowsFalse,
                                    onCheckedChange: (checked)=>handleAllowedChange(false, checked)
                                }),
                                /*#__PURE__*/ jsx(Label, {
                                    htmlFor: allowFalseId,
                                    className: "cursor-pointer",
                                    children: t.booleanAllowFalseLabel
                                })
                            ]
                        })
                    ]
                }),
                !allowsTrue && !allowsFalse && /*#__PURE__*/ jsx("p", {
                    className: "text-xs text-amber-600 mt-2",
                    children: t.booleanNeitherWarning
                })
            ]
        })
    });
};
const BooleanEditor = BooleanEditor_BooleanEditor;
export { BooleanEditor as default };
