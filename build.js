import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

  await build({
    bundle: true,
    sourcemap: true,
    format: "esm",
    target: "esnext",
    entryPoints: [path.join(__dirname, "src", "index.ts")],
    outdir: path.join(__dirname, "dist"),
    outExtension: { ".js": ".mjs" },
    plugins: [NodeModulesPolyfillPlugin()],
    watch: process.argv.includes('--watch'),
    logLevel: 'debug'
  });
