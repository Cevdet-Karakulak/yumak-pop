const fs = require('fs');
const path = require('path');

console.log('[patch-ios-swift] Running Swift compatibility patches...');

// 1. Patch Package.swift files to swift-tools-version: 6.0 and ensure swiftLanguageModes: [.v6] with minimal concurrency
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
        // Swift 6 mode is strictly required by ExpoModulesJSI for C++ interop, Task.immediate and consuming: labels
        if (content.includes('swiftLanguageModes: [.v5]')) {
          content = content.replace(/swiftLanguageModes:\s*\[\.v5\]/g, 'swiftLanguageModes: [.v6]');
          changed = true;
          console.log(`[patch-ios-swift] Set swiftLanguageModes to [.v6] in: ${fullPath}`);
        }
        // Add minimal strict concurrency flag to suppress fatal data-race errors in Swift 6 mode
        if (!content.includes('"-strict-concurrency=minimal"') && content.includes('"-enable-library-evolution"')) {
          content = content.replace(
            /["']-enable-library-evolution["'],/g,
            `"-enable-library-evolution",\n          "-Xfrontend",\n          "-strict-concurrency=minimal",`
          );
          changed = true;
          console.log(`[patch-ios-swift] Added -strict-concurrency=minimal to: ${fullPath}`);
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

// 6. Patch JavaScriptActor.swift in expo-modules-jsi (make runIsolated nonisolated taking () -> T so assumeIsolated needs neither actor access nor escaping conversion)
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

  // Remove @JavaScriptActor from runIsolated / runIsolatedThrowing and from their operation parameter
  if (content.includes('@JavaScriptActor\n  @usableFromInline\n  internal static func runIsolated')) {
    content = content.replace(
      /@JavaScriptActor\s*\n\s*@usableFromInline\s*\n\s*internal static func runIsolated/g,
      '@usableFromInline\n  internal static func runIsolated'
    );
    changed = true;
  }

  if (content.includes('internal static func runIsolated<T: ~Copyable>(_ operation: @JavaScriptActor () -> T) -> T')) {
    content = content.replace(
      'internal static func runIsolated<T: ~Copyable>(_ operation: @JavaScriptActor () -> T) -> T',
      'internal static func runIsolated<T: ~Copyable>(_ operation: () -> T) -> T'
    );
    changed = true;
  }

  if (content.includes('internal static func runIsolatedThrowing<T: ~Copyable>(_ operation: @JavaScriptActor () throws -> T) throws -> T')) {
    content = content.replace(
      'internal static func runIsolatedThrowing<T: ~Copyable>(_ operation: @JavaScriptActor () throws -> T) throws -> T',
      'internal static func runIsolatedThrowing<T: ~Copyable>(_ operation: () throws -> T) throws -> T'
    );
    changed = true;
  }

  // Update IsolatedRunner typealiases in assumeIsolated to match nonisolated runIsolated
  if (content.includes('typealias IsolatedRunner = @JavaScriptActor (@JavaScriptActor () -> T) -> T')) {
    content = content.replace(
      'typealias IsolatedRunner = @JavaScriptActor (@JavaScriptActor () -> T) -> T',
      'typealias IsolatedRunner = (() -> T) -> T'
    );
    changed = true;
  }

  if (content.includes('typealias IsolatedRunner = @JavaScriptActor (@JavaScriptActor () throws -> T) throws -> T') ||
      content.includes('typealias IsolatedRunner = (() throws -> T) -> T')) {
    content = content.replace(
      /typealias IsolatedRunner = (?:@JavaScriptActor \(@JavaScriptActor \(\) throws -> T\) throws -> T|\(\(\) throws -> T\) -> T)/g,
      'typealias IsolatedRunner = (() throws -> T) throws -> T'
    );
    changed = true;
  }

  // Restore runner call if previously replaced with NonisolatedOp
  const prevNonisolatedOp = `    typealias NonisolatedOp = () -> T
    let raw = unsafeBitCast(operation, to: NonisolatedOp.self)
    return raw()`;
  if (content.includes(prevNonisolatedOp)) {
    content = content.replace(
      prevNonisolatedOp,
      `    let runner = unsafeBitCast(runIsolated as IsolatedRunner, to: NonisolatedRunner.self)
    return runner(operation)`
    );
    changed = true;
  }

  const prevNonisolatedOpThrowing = `    typealias NonisolatedOp = () throws -> T
    let raw = unsafeBitCast(operation, to: NonisolatedOp.self)
    return try raw()`;
  if (content.includes(prevNonisolatedOpThrowing)) {
    content = content.replace(
      prevNonisolatedOpThrowing,
      `    let runner = unsafeBitCast(runIsolatedThrowing as IsolatedRunner, to: NonisolatedRunner.self)
    return try runner(operation)`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(jsActorPath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully patched JavaScriptActor.swift assumeIsolated & runIsolated for Swift 6.0!');
  } else {
    console.log('[patch-ios-swift] JavaScriptActor.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptActor.swift not found at:', jsActorPath);
}

// 7. Patch JavaScriptRuntime.swift in expo-modules-jsi (replace bare-slash regex with NSRegularExpression / range)
const jsRuntimePath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptRuntime.swift'
);

if (fs.existsSync(jsRuntimePath)) {
  let content = fs.readFileSync(jsRuntimePath, 'utf8');
  const target = 'if name.wholeMatch(of: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/) == nil {';
  const replacement = 'if name.range(of: "^[a-zA-Z_$][a-zA-Z0-9_$]*$", options: .regularExpression) == nil {';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(jsRuntimePath, content, 'utf8');
    console.log('[patch-ios-swift] Successfully replaced bare-slash regex in JavaScriptRuntime.swift!');
  } else {
    console.log('[patch-ios-swift] JavaScriptRuntime.swift regex already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptRuntime.swift not found at:', jsRuntimePath);
}

// 8. Patch JavaScriptPromise.swift in expo-modules-jsi (remove @JavaScriptActor from LongLivedState and add nonisolated init)
const jsPromisePath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'Values',
  'JavaScriptPromise.swift'
);

if (fs.existsSync(jsPromisePath)) {
  let content = fs.readFileSync(jsPromisePath, 'utf8');
  let changed = false;
  if (content.includes('@JavaScriptActor\n  private final class LongLivedState: LongLivedObject {')) {
    content = content.replace(
      /@JavaScriptActor\s*\n\s*private final class LongLivedState: LongLivedObject {/g,
      'private final class LongLivedState: LongLivedObject {\n    nonisolated init() {}'
    );
    changed = true;
    console.log('[patch-ios-swift] Successfully patched LongLivedState in JavaScriptPromise.swift!');
  }
  if (changed) {
    fs.writeFileSync(jsPromisePath, content, 'utf8');
  } else {
    console.log('[patch-ios-swift] JavaScriptPromise.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptPromise.swift not found at:', jsPromisePath);
}

// 9. Patch JavaScriptCallback.swift in expo-modules-jsi (LongLivedState nonisolated init + @Sendable on local @JavaScriptActor func call)
const jsCallbackPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI',
  'Runtime',
  'JavaScriptCallback.swift'
);

if (fs.existsSync(jsCallbackPath)) {
  let content = fs.readFileSync(jsCallbackPath, 'utf8');
  let changed = false;
  if (content.includes('@JavaScriptActor\n  private final class LongLivedState: LongLivedObject {')) {
    content = content.replace(
      /@JavaScriptActor\s*\n\s*private final class LongLivedState: LongLivedObject {/g,
      'private final class LongLivedState: LongLivedObject {\n    nonisolated init() {}'
    );
    changed = true;
    console.log('[patch-ios-swift] Successfully patched LongLivedState in JavaScriptCallback.swift!');
  }

  // In Swift 6.0 (Xcode 16), local @JavaScriptActor func declarations cannot be marked @Sendable and are not inferred as @Sendable.
  // Convert them to typed @JavaScriptActor @Sendable closure constants (let call: ... = { function, runtime in ... })
  const voidCallRegex = /    @JavaScriptActor(?: @Sendable)?\n    func call\(_ function: borrowing JavaScriptFunction, _ runtime: JavaScriptRuntime\) throws \{/g;
  if (voidCallRegex.test(content)) {
    content = content.replace(
      voidCallRegex,
      '    let call: @JavaScriptActor @Sendable (borrowing JavaScriptFunction, JavaScriptRuntime) throws -> Void = { function, runtime in'
    );
    changed = true;
    console.log('[patch-ios-swift] Converted local Void func call to @JavaScriptActor @Sendable closure in JavaScriptCallback.swift!');
  }

  const boxCallRegex = /    @JavaScriptActor(?: @Sendable)?\n    func call\(_ function: borrowing JavaScriptFunction, _ runtime: JavaScriptRuntime\) throws -> UncheckedSendableBox<R>\n    \{/g;
  if (boxCallRegex.test(content)) {
    content = content.replace(
      boxCallRegex,
      '    let call: @JavaScriptActor @Sendable (borrowing JavaScriptFunction, JavaScriptRuntime) throws -> UncheckedSendableBox<R> = { function, runtime in'
    );
    changed = true;
    console.log('[patch-ios-swift] Converted local UncheckedSendableBox func call to @JavaScriptActor @Sendable closure in JavaScriptCallback.swift!');
  }

  // Also ensure @escaping @JavaScriptActor closures captured by local func call are explicitly @Sendable
  if (content.includes('@escaping @JavaScriptActor (')) {
    content = content.replace(
      /@escaping @JavaScriptActor \(/g,
      '@escaping @JavaScriptActor @Sendable ('
    );
    changed = true;
    console.log('[patch-ios-swift] Added @Sendable to @escaping @JavaScriptActor closures in JavaScriptCallback.swift!');
  }

  if (changed) {
    fs.writeFileSync(jsCallbackPath, content, 'utf8');
  } else {
    console.log('[patch-ios-swift] JavaScriptCallback.swift already patched.');
  }
} else {
  console.log('[patch-ios-swift] JavaScriptCallback.swift not found at:', jsCallbackPath);
}

// 10. Patch build-xcframework.sh in expo-modules-jsi to pass SWIFT_STRICT_CONCURRENCY=minimal
const buildXcfPath = path.resolve(
  nodeModulesDir,
  'expo-modules-jsi',
  'apple',
  'scripts',
  'build-xcframework.sh'
);

if (fs.existsSync(buildXcfPath)) {
  let content = fs.readFileSync(buildXcfPath, 'utf8');
  if (!content.includes('SWIFT_STRICT_CONCURRENCY=minimal') && content.includes('SWIFT_COMPILATION_MODE=wholemodule')) {
    content = content.replace(
      'SWIFT_COMPILATION_MODE=wholemodule \\',
      'SWIFT_COMPILATION_MODE=wholemodule \\\n    SWIFT_STRICT_CONCURRENCY=minimal \\'
    );
    fs.writeFileSync(buildXcfPath, content, 'utf8');
    console.log('[patch-ios-swift] Added SWIFT_STRICT_CONCURRENCY=minimal to build-xcframework.sh!');
  } else {
    console.log('[patch-ios-swift] build-xcframework.sh already patched.');
  }
}

console.log('[patch-ios-swift] All Swift compatibility patches applied successfully!');
