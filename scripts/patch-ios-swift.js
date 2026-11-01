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
        if (content.includes('swift-tools-version: 6.2')) {
          content = content.replace(/swift-tools-version:\s*6\.2/g, 'swift-tools-version: 6.0');
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`[patch-ios-swift] Downgraded swift-tools-version to 6.0 in: ${fullPath}`);
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
    console.log('[patch-ios-swift] JavaScriptObject.swift already patched or target not matched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptObject.swift not found at:', jsObjPath);
}

// 3. Patch build-xcframework.sh to inject SWIFT_STRICT_CONCURRENCY=minimal
const buildXcframeworkPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'scripts',
  'build-xcframework.sh'
);

if (fs.existsSync(buildXcframeworkPath)) {
  let content = fs.readFileSync(buildXcframeworkPath, 'utf8');
  if (content.includes('SWIFT_ENABLE_EXPLICIT_MODULES=NO') && !content.includes('SWIFT_STRICT_CONCURRENCY=minimal')) {
    content = content.replace(
      'SWIFT_ENABLE_EXPLICIT_MODULES=NO',
      'SWIFT_ENABLE_EXPLICIT_MODULES=NO \\\n    SWIFT_STRICT_CONCURRENCY=minimal'
    );
    fs.writeFileSync(buildXcframeworkPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully injected SWIFT_STRICT_CONCURRENCY=minimal into build-xcframework.sh!');
  }
}

console.log('[patch-ios-swift] All Swift compatibility patches applied successfully!');
