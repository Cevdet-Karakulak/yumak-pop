const fs = require('fs');
const path = require('path');

console.log('[patch-ios-swift] Running Swift compatibility patches...');

// 1. Patch Package.swift files to swift-tools-version: 6.0
function patchPackageSwift(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git') {
        patchPackageSwift(fullPath);
      }
    } else if (entry.name === 'Package.swift') {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        if (content.includes('swift-tools-version: 6.2')) {
          content = content.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.0');
          changed = true;
          console.log(`[patch-ios-swift] Downgraded swift-tools-version to 6.0 in: ${fullPath}`);
        }
        // Remove invalid -Werror warning group flags (e.g. "-Werror", "ImplicitStrongCapture") rejected by Swift 6.0 driver
        if (content.includes('-Werror')) {
          content = content.replace(/["']-Werror["'],\s*["'][A-Za-z0-9_-]+["'],?/g, '');
          changed = true;
          console.log(`[patch-ios-swift] Stripped invalid -Werror warning flags in: ${fullPath}`);
        }
        // Remove trailing commas before closing parentheses (invalid in Swift 6.0 Package.swift parser)
        if (/,\s*\)/.test(content)) {
          content = content.replace(/,\s*\)/g, ')');
          changed = true;
          console.log(`[patch-ios-swift] Stripped trailing commas before ')' in: ${fullPath}`);
        }
        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      } catch (err) {
        console.warn(`[patch-ios-swift] Could not patch ${fullPath}:`, err.message);
      }
    }
  }
}

const nodeModulesDir = path.resolve(__dirname, '..', 'node_modules');
patchPackageSwift(nodeModulesDir);

// 2. Patch JavaScriptObject.swift in expo-modules-jsi
const jsObjPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'Values',
  'JavaScriptObject.swift'
);

if (fs.existsSync(jsObjPath)) {
  let content = fs.readFileSync(jsObjPath, 'utf8');
  const target = `    try runtime._withUnsafeGuaranteedRef { runtime in
      try JavaScriptActor.assumeIsolated {
        try encode(JavaScriptValue.Slot(slot), runtime)
      }
    }`;

  const replacement = `    try runtime._withUnsafeGuaranteedRef { runtime in
      let rawSlot = UInt(bitPattern: slot)
      try JavaScriptActor.assumeIsolated {
        let localSlot = UnsafeMutablePointer<facebook.jsi.Value>(bitPattern: rawSlot)!
        try encode(JavaScriptValue.Slot(localSlot), runtime)
      }
    }`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(jsObjPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully patched JavaScriptObject.swift for Swift 6 data-race immunity!');
  } else {
    console.log('[patch-ios-swift] JavaScriptObject.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptObject.swift not found at:', jsObjPath);
}

console.log('[patch-ios-swift] All Swift compatibility patches applied successfully!');
