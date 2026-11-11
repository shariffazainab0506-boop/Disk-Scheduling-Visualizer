// scripts/postinstall.js
import fs from 'fs';
import path from 'path';

const nativeJsPath = path.resolve('node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes("@rollup/wasm-node")) {
    const target = `const nativeModule = requireWithFriendlyError(
\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
);`;
    const replacement = `let nativeModule;
try {
\tnativeModule = requireWithFriendlyError(
\t\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
\t);
} catch (e) {
\tnativeModule = require('@rollup/wasm-node/dist/native.js');
}`;
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(nativeJsPath, content, 'utf8');
      console.log('Successfully patched rollup for wasm fallback.');
    }
  }
}
