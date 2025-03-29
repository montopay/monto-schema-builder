import assert from "node:assert";
import { createRequire } from "node:module";
import { test } from "node:test";
import {
  isBooleanSchema,
  isObjectSchema,
  jsonSchemaType,
} from "../dist-test/jsonSchema.js";

// Setup require for importing JSON
const require = createRequire(import.meta.url);
const metaschema = require("../metaschema.schema.json");

test("should successfully parse the JSON Schema metaschema", () => {
  const result = jsonSchemaType.safeParse(metaschema);
  if (!result.success) {
    console.error("Validation error:", result.error);
  }
  assert.strictEqual(result.success, true);
});

test("schema type checker functions should work correctly", () => {
  const objectSchema = { type: "object", properties: {} };
  const booleanSchema = true;

  assert.strictEqual(isObjectSchema(objectSchema), true);
  assert.strictEqual(isBooleanSchema(objectSchema), false);

  assert.strictEqual(isObjectSchema(booleanSchema), false);
  assert.strictEqual(isBooleanSchema(booleanSchema), true);
});
