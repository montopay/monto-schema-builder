import { jsx, jsxs } from "react/jsx-runtime";
import { Suspense, lazy } from "react";
import { withObjectSchema } from "../../types/jsonSchema.js";
const StringEditor = /*#__PURE__*/ lazy(()=>import("./types/StringEditor.js"));
const NumberEditor = /*#__PURE__*/ lazy(()=>import("./types/NumberEditor.js"));
const BooleanEditor = /*#__PURE__*/ lazy(()=>import("./types/BooleanEditor.js"));
const ObjectEditor = /*#__PURE__*/ lazy(()=>import("./types/ObjectEditor.js"));
const ArrayEditor = /*#__PURE__*/ lazy(()=>import("./types/ArrayEditor.js"));
const TypeEditor = ({ schema, onChange, depth = 0 })=>{
    const type = withObjectSchema(schema, (s)=>s.type || "object", "string");
    return /*#__PURE__*/ jsxs(Suspense, {
        fallback: /*#__PURE__*/ jsx("div", {
            children: "Loading editor..."
        }),
        children: [
            "string" === type && /*#__PURE__*/ jsx(StringEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth
            }),
            "number" === type && /*#__PURE__*/ jsx(NumberEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth
            }),
            "integer" === type && /*#__PURE__*/ jsx(NumberEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth,
                integer: true
            }),
            "boolean" === type && /*#__PURE__*/ jsx(BooleanEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth
            }),
            "object" === type && /*#__PURE__*/ jsx(ObjectEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth
            }),
            "array" === type && /*#__PURE__*/ jsx(ArrayEditor, {
                schema: schema,
                onChange: onChange,
                depth: depth
            })
        ]
    });
};
const SchemaEditor_TypeEditor = TypeEditor;
export { SchemaEditor_TypeEditor as default };
