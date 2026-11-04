const fs = require('fs');
const path = require('path');

console.log('[patch-ios-swift] Running Swift compatibility patches...');

// 1. Patch Package.swift files to swift-tools-version: 6.0 and swiftLanguageModes: [.v5]
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
        if (content.includes('swiftLanguageModes: [.v6]')) {
          content = content.replace(/swiftLanguageModes:\s*\[\.v6\]/g, 'swiftLanguageModes: [.v5]');
          changed = true;
          console.log(`[patch-ios-swift] Changed swiftLanguageModes to [.v5] in: ${fullPath}`);
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

// 3. Patch RuntimeScheduler.h in expo-modules-jsi (strip SWIFT_RETURNS_RETAINED which is unknown in Swift 6.0 / Clang)
const runtimeSchedulerPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI-Cxx',
  'include',
  'RuntimeScheduler.h'
);

if (fs.existsSync(runtimeSchedulerPath)) {
  let content = fs.readFileSync(runtimeSchedulerPath, 'utf8');
  if (content.includes('SWIFT_RETURNS_RETAINED')) {
    content = content.replace(/\s*SWIFT_RETURNS_RETAINED/g, '');
    fs.writeFileSync(runtimeSchedulerPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully stripped SWIFT_RETURNS_RETAINED from RuntimeScheduler.h for Swift 6.0!');
  } else {
    console.log('[patch-ios-swift] RuntimeScheduler.h already patched.');
  }
} else {
  console.log('[patch-ios-swift] RuntimeScheduler.h not found at:', runtimeSchedulerPath);
}

// 4. Patch JavaScriptRef.swift in expo-modules-jsi (strip Escapable which requires experimental NonescapableTypes in Swift 6.0)
const jsRefPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptRef.swift'
);

if (fs.existsSync(jsRefPath)) {
  let content = fs.readFileSync(jsRefPath, 'utf8');
  if (content.includes(', Escapable')) {
    content = content.replace(/,\s*Escapable/g, '');
    fs.writeFileSync(jsRefPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully stripped Escapable from JavaScriptRef.swift!');
  } else {
    console.log('[patch-ios-swift] JavaScriptRef.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptRef.swift not found at:', jsRefPath);
}

// 5. Patch JavaScriptError.swift in expo-modules-jsi (remove public from CppError extension to prevent library evolution error)
const jsErrPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'Values',
  'JavaScriptError.swift'
);

if (fs.existsSync(jsErrPath)) {
  let content = fs.readFileSync(jsErrPath, 'utf8');
  const target = `extension expo.CppError: Error {
  public var message: String {`;
  const replacement = `extension expo.CppError: Error {
  var message: String {`;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(jsErrPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully patched JavaScriptError.swift CppError extension!');
  } else {
    console.log('[patch-ios-swift] JavaScriptError.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptError.swift not found at:', jsErrPath);
}

// 6. Patch JavaScriptActor.swift in expo-modules-jsi (remove @JavaScriptActor from static runIsolated to allow nonisolated callers)
const jsActorPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptActor.swift'
);

if (fs.existsSync(jsActorPath)) {
  let content = fs.readFileSync(jsActorPath, 'utf8');
  let changed = false;
  if (content.includes('@JavaScriptActor\n  @usableFromInline\n  internal static func runIsolated')) {
    content = content.replace(
      /@JavaScriptActor\s*\n\s*@usableFromInline\s*\n\s*internal static func runIsolated/g,
      '@usableFromInline\n  internal static func runIsolated'
    );
    changed = true;
    console.log('[patch-ios-swift] Successfully made runIsolated nonisolated in JavaScriptActor.swift!');
  }
  if (changed) {
    fs.writeFileSync(jsActorPath, content, 'utf8');
  } else {
    console.log('[patch-ios-swift] JavaScriptActor.swift runIsolated already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptActor.swift not found at:', jsActorPath);
}

console.log('[patch-ios-swift] All Swift compatibility patches applied successfully!');
