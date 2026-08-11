import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const PROPERTY_ACTION_MODULES = [
  "src/app/cockpit/yzi-imob/imoveis/[id]/actions.ts",
  "src/app/cockpit/yzi-imob/imoveis/[id]/creative/actions.ts",
  "src/app/cockpit/yzi-imob/imoveis/[id]/media-actions.ts",
  "src/app/cockpit/yzi-imob/imoveis/[id]/publication-actions.ts",
] as const;

test('property "use server" modules only expose async runtime functions', async () => {
  for (const relativePath of PROPERTY_ACTION_MODULES) {
    const source = await readFile(path.join(process.cwd(), relativePath), "utf8");
    assert.match(source, /^\s*["']use server["'];/);

    const runtimeExports = source.match(/^export\s+(?!type\b|interface\b).+$/gm) ?? [];
    assert.deepEqual(
      runtimeExports.filter((line) => !/^export\s+async\s+function\b/.test(line)),
      [],
      `${relativePath} has a non-async runtime export`,
    );
  }
});
