import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load the actual application modules; substitute only the external service boundary.
export function loadTypeScript(relativePath, mocks = {}) {
  const root = path.resolve(__dirname, '../..')
  const cache = new Map()
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const source = fs.readFileSync(filename, 'utf8')
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
      reportDiagnostics: true,
    })
    const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? []
    if (errors.length) throw new Error(ts.formatDiagnostics(errors, {
      getCanonicalFileName: name => name,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }))
    const compiledModule = { exports: {} }
    cache.set(filename, compiledModule)
    const nativeRequire = createRequire(filename)
    function localRequire(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id]
      if (id.startsWith('@/') || id.startsWith('.')) {
        const base = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(filename), id)
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
        if (!resolved) throw new Error(`Unresolved application import: ${id}`)
        return load(resolved)
      }
      return nativeRequire(id)
    }
    const execute = new vm.Script(`(function(require, module, exports) {\n${compiled.outputText}\n})`, { filename }).runInThisContext()
    execute(localRequire, compiledModule, compiledModule.exports)
    return compiledModule.exports
  }
  return load(path.resolve(root, relativePath))
}

