#!/usr/bin/env node
/**
 * Verifies every static blueprint in src/lib/blueprints.ts:
 *   - question distribution (with optional marksPerType overrides) sums to totalMarks
 *   - unitWeightage marks sum to totalMarks
 *   - blueprint ids are unique
 *
 * Dependency-free: uses the project's own `typescript` package to transpile the
 * sources to ESM in a temp directory, then imports them. Exits 1 on any mismatch.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = mkdtempSync(path.join(tmpdir(), "check-blueprints-"));

function transpile(relPath, outName) {
  const source = readFileSync(path.join(root, relPath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: relPath,
  });
  // Rewrite the runtime-relevant local imports to the transpiled copies.
  const rewritten = outputText.replace(
    /from\s+["'](?:@\/lib\/|\.\/)(marks|subject-detection)["']/g,
    'from "./$1.mjs"'
  );
  if (/from\s+["'](?:@\/|\.\.?\/)(?![^"']*\.mjs["'])/.test(rewritten)) {
    throw new Error(`${relPath} has a local runtime import the checker does not transpile.`);
  }
  writeFileSync(path.join(outDir, outName), rewritten);
}

let exitCode = 0;
try {
  transpile("src/lib/marks.ts", "marks.mjs");
  transpile("src/lib/subject-detection.ts", "subject-detection.mjs");
  transpile("src/lib/blueprints.ts", "blueprints.mjs");

  const { computeDistributionTotal } = await import(
    pathToFileURL(path.join(outDir, "marks.mjs")).href
  );
  const { BLUEPRINTS } = await import(
    pathToFileURL(path.join(outDir, "blueprints.mjs")).href
  );

  const problems = [];
  const seen = new Map();

  for (const bp of BLUEPRINTS) {
    if (seen.has(bp.id)) {
      problems.push(`${bp.id}: duplicate id`);
    }
    seen.set(bp.id, true);

    const distTotal = computeDistributionTotal(bp.questionDistribution, bp.marksPerType);
    if (distTotal !== bp.totalMarks) {
      problems.push(
        `${bp.id}: questionDistribution sums to ${distTotal}, totalMarks is ${bp.totalMarks}` +
          (bp.marksPerType ? ` (marksPerType ${JSON.stringify(bp.marksPerType)})` : "")
      );
    }

    const unitTotal = (bp.unitWeightage || []).reduce((s, u) => s + (Number(u.marks) || 0), 0);
    if ((bp.unitWeightage || []).length > 0 && unitTotal !== bp.totalMarks) {
      problems.push(`${bp.id}: unitWeightage sums to ${unitTotal}, totalMarks is ${bp.totalMarks}`);
    }
  }

  // Lookup regression cases (subject keys as sent by the wizard).
  const { getBlueprint } = await import(pathToFileURL(path.join(outDir, "blueprints.mjs")).href);
  const lookupCases = [
    ["11", "hindi_core", null],
    ["11", "hindi_elective", "cbse-11-hindielective-2026"],
    ["12", "hindi_elective", "cbse-12-hindielective-2026"],
    ["12", "hindi_core", "cbse-12-hindi-2026"],
    ["11", "english", "cbse-11-englishcore-2026"],
    ["12", "english", "cbse-12-english-2026"],
    ["12", "economics", "cbse-12-economics-2026"],
    ["12", "accounts", "cbse-12-accountancy-2026"],
    ["12", "polscience", "cbse-12-polscience-2026"],
    ["12", "cs", "cbse-12-cs-2026"],
    ["10", "social", "cbse-10-social-2026"],
    ["10", "science", "cbse-10-science-2026"],
    ["11", "applied_maths", null],
  ];
  for (const [classId, subject, expected] of lookupCases) {
    const found = getBlueprint(classId, subject, "annual_exam");
    const got = found ? found.id : null;
    if (got !== expected) {
      problems.push(`lookup(${classId}, ${subject}) returned ${got}, expected ${expected}`);
    }
  }

  console.log(`Checked ${BLUEPRINTS.length} blueprints and ${lookupCases.length} lookups.`);
  if (problems.length > 0) {
    console.error(`${problems.length} mismatch(es):`);
    for (const p of problems) console.error(`  - ${p}`);
    exitCode = 1;
  } else {
    console.log("All blueprints consistent (0 mismatches).");
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
process.exit(exitCode);
