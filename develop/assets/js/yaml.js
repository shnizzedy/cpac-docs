var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Helper to dynamically load the CDN js-yaml script and return its global object
function loadJsYamlCdn() {
    return new Promise((resolve, reject) => {
        const globalWindow = window;
        if (globalWindow.jsyaml) {
            resolve(globalWindow.jsyaml);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
        script.onload = () => {
            if (globalWindow.jsyaml) {
                resolve(globalWindow.jsyaml);
            }
            else {
                reject(new Error('Failed to load js-yaml from CDN'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load js-yaml script'));
        document.head.appendChild(script);
    });
}
// Recursive include resolver
function resolveIncludes(yamlText, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const lines = yamlText.split('\n');
        const resolvedLines = yield Promise.all(lines.map((line) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const match = line.match(/^(\s*[^:]+:\s*)!include\s+(.*)$/);
            if (match) {
                const indent = match[1];
                const includePath = match[2].trim();
                const includeUrl = new URL(includePath, baseUrl).href;
                const includedResponse = yield fetch(includeUrl);
                if (!includedResponse.ok) {
                    throw new Error(`Failed to fetch included file: ${includeUrl}`);
                }
                const includedText = yield includedResponse.text();
                const ext = (_a = includePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (ext === 'json') {
                    const json = JSON.parse(includedText);
                    return indent + JSON.stringify(json, null, 2).replace(/\n/g, '\n' + ' '.repeat(indent.length));
                }
                else if (ext === 'yaml' || ext === 'yml') {
                    const resolved = yield resolveIncludes(includedText, includeUrl);
                    return resolved
                        .split('\n')
                        .map(subLine => indent + subLine)
                        .join('\n');
                }
                else {
                    return indent + JSON.stringify(includedText); // treat as raw string
                }
            }
            return line;
        })));
        return resolvedLines.join('\n');
    });
}
// Recursive async YAML loader with support for !include
export function loadYaml(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsyaml = yield loadJsYamlCdn();
        const { DEFAULT_SCHEMA, load: jsLoadYamlSync } = jsyaml;
        function fetchAndParse(currentUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(currentUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${currentUrl}`);
                }
                const text = yield response.text();
                const resolvedText = yield resolveIncludes(text, currentUrl);
                const parsed = jsLoadYamlSync(resolvedText, { schema: DEFAULT_SCHEMA });
                return parsed;
            });
        }
        return yield fetchAndParse(url);
    });
}
