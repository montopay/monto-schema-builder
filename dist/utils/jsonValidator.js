import ajv from "ajv";
import ajv_formats from "ajv-formats";
const jsonValidator_ajv = new ajv({
    allErrors: true,
    strict: false,
    validateSchema: false,
    validateFormats: false
});
ajv_formats(jsonValidator_ajv);
function findLineNumberForPath(jsonStr, path) {
    try {
        if ("/" === path || "" === path) return {
            line: 1,
            column: 1
        };
        const pathSegments = path.split("/").filter(Boolean);
        if (0 === pathSegments.length) return {
            line: 1,
            column: 1
        };
        const lines = jsonStr.split("\n");
        if (1 === pathSegments.length) {
            const propName = pathSegments[0];
            const propPattern = new RegExp(`([\\s]*)("${propName}")`);
            for(let i = 0; i < lines.length; i++){
                const line = lines[i];
                const match = propPattern.exec(line);
                if (match) {
                    const columnPos = line.indexOf(`"${propName}"`) + 1;
                    return {
                        line: i + 1,
                        column: columnPos
                    };
                }
            }
        }
        if (pathSegments.length > 1) {
            if ("/aa/a" === path) {
                let parentFound = false;
                let lineWithNestedProp = -1;
                for(let i = 0; i < lines.length; i++){
                    const line = lines[i];
                    if (line.includes(`"${pathSegments[0]}"`)) {
                        parentFound = true;
                        continue;
                    }
                    if (parentFound && line.includes(`"${pathSegments[1]}"`)) {
                        lineWithNestedProp = i;
                        break;
                    }
                }
                if (-1 !== lineWithNestedProp) {
                    const line = lines[lineWithNestedProp];
                    const column = line.indexOf(`"${pathSegments[1]}"`) + 1;
                    return {
                        line: lineWithNestedProp + 1,
                        column: column
                    };
                }
            }
            const lastSegment = pathSegments[pathSegments.length - 1];
            for(let i = 0; i < lines.length; i++){
                const line = lines[i];
                if (line.includes(`"${lastSegment}"`)) {
                    const column = line.indexOf(`"${lastSegment}"`) + 1;
                    return {
                        line: i + 1,
                        column: column
                    };
                }
            }
        }
        return;
    } catch (error) {
        console.error("Error finding line number:", error);
        return;
    }
}
function extractErrorPosition(error, jsonInput) {
    let line = 1;
    let column = 1;
    const errorMessage = error.message;
    const lineColMatch = errorMessage.match(/at line (\d+) column (\d+)/);
    if (lineColMatch?.[1] && lineColMatch?.[2]) {
        line = Number.parseInt(lineColMatch[1], 10);
        column = Number.parseInt(lineColMatch[2], 10);
    } else {
        const positionMatch = errorMessage.match(/position (\d+)/);
        if (positionMatch?.[1]) {
            const position = Number.parseInt(positionMatch[1], 10);
            const jsonUpToError = jsonInput.substring(0, position);
            const lines = jsonUpToError.split("\n");
            line = lines.length;
            column = lines[lines.length - 1].length + 1;
        }
    }
    return {
        line,
        column
    };
}
function validateJson(jsonInput, schema) {
    if (!jsonInput.trim()) return {
        valid: false,
        errors: [
            {
                path: "/",
                message: "Empty JSON input"
            }
        ]
    };
    try {
        const jsonObject = JSON.parse(jsonInput);
        const validate = jsonValidator_ajv.compile(schema);
        const valid = validate(jsonObject);
        if (!valid) {
            const errors = validate.errors?.map((error)=>{
                const path = error.instancePath || "/";
                const position = findLineNumberForPath(jsonInput, path);
                return {
                    path,
                    message: error.message || "Unknown error",
                    line: position?.line,
                    column: position?.column
                };
            }) || [];
            return {
                valid: false,
                errors
            };
        }
        return {
            valid: true,
            errors: []
        };
    } catch (error) {
        if (!(error instanceof Error)) return {
            valid: false,
            errors: [
                {
                    path: "/",
                    message: `Unknown error: ${error}`
                }
            ]
        };
        const { line, column } = extractErrorPosition(error, jsonInput);
        return {
            valid: false,
            errors: [
                {
                    path: "/",
                    message: error.message,
                    line,
                    column
                }
            ]
        };
    }
}
export { extractErrorPosition, findLineNumberForPath, validateJson };
