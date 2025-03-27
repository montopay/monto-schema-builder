import { describe, expect, it } from "vitest";
import metaschema from "../../../metaschema.schema.json";
import { jsonSchemaType } from "../jsonSchema";

describe("JSON Schema Parser", () => {
  it("should successfully parse the JSON Schema metaschema", () => {
    const result = jsonSchemaType.safeParse(metaschema);
    if (!result.success) {
      console.error("result.error", result.error);
    }
    expect(result.success).toBe(true);
  });
});
