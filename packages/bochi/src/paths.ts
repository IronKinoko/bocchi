import path from "path";
import fs from "fs-extra";

function resolveApp(...rest: string[]) {
  return path.resolve(process.cwd(), ...rest);
}

function resolveInput() {
  const base = resolveApp("src", "index");
  const index = [".ts", ".js"]
    .map((extension) => base + extension)
    .find((file) => fs.existsSync(file));

  if (!index) throw new Error("ensure src/index exists");
  return index;
}

export const paths = {
  resolveApp,
  root: resolveApp(),
  meta: resolveApp("meta.template"),
  package: resolveApp("package.json"),
  input: resolveInput(),
  output: resolveApp("dist", "index.user.js"),
  outputDev: resolveApp("dist", "index.dev.js"),
};
