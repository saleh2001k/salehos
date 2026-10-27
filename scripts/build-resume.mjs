import { readFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
async function loadData(name) {
  const source = readFileSync(path.join(root, "src/data", name), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const content = await loadData("content.ts");
const { packages } = await loadData("packages.ts");
mkdirSync(path.join(root, "output/pdf"), { recursive: true });
const result = spawnSync(
  process.env.PORTFOLIO_PYTHON || "python3",
  [path.join(root, "scripts/build-resume.py"), root],
  {
    input: JSON.stringify({ ...content, packages }),
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
