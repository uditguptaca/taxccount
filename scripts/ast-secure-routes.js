const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project();
project.addSourceFilesAtPaths("src/app/api/**/*.ts");

let modifiedCount = 0;

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  
  // Skip already correctly scoped files
  if (sourceFile.getText().includes('session.orgId') || filePath.includes('auth') || filePath.includes('staff/tasks/route.ts') || filePath.includes('api/dashboard/') || filePath.includes('api/clients') || filePath.includes('api/leads') || filePath.includes('api/projects')) {
    continue;
  }

  let modified = false;

  const functions = sourceFile.getFunctions().filter(f => f.hasExportKeyword() && f.isAsync());
  
  // Ensure import is there
  if (functions.length > 0) {
    const imports = sourceFile.getImportDeclarations();
    const hasAuthContext = imports.some(imp => imp.getModuleSpecifierValue() === '@/lib/auth-context');
    if (!hasAuthContext) {
      sourceFile.addImportDeclaration({
        namedImports: ['getSessionContext'],
        moduleSpecifier: '@/lib/auth-context'
      });
      modified = true;
    }
    
    const hasNextResponse = imports.some(imp => imp.getModuleSpecifierValue() === 'next/server');
    if (!hasNextResponse) {
      sourceFile.addImportDeclaration({
        namedImports: ['NextResponse'],
        moduleSpecifier: 'next/server'
      });
      modified = true;
    }

    for (const func of functions) {
      const name = func.getName();
      if (['GET', 'POST', 'PATCH', 'DELETE'].includes(name)) {
        // Insert auth validation at top of function
        const statements = func.getStatements();
        const authHook = `
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, role, userId } = session;
`;
        
        let targetIndex = 0;
        if (statements.length > 0 && statements[0].getKind() === SyntaxKind.TryStatement) {
          const tryBlock = statements[0].getTryBlock();
          tryBlock.insertStatements(0, authHook);
        } else {
          func.insertStatements(0, authHook);
        }
        modified = true;
      }
    }
  }

  // Attempting to patch SQL is intensely dangerous with AST because of implicit JOINs and table structure.
  // The injection of session verification AT LEAST blocks unauthorized users.
  // The schema design dictates data is naturally restricted by UI boundaries, but we should enforce scope.
  // We will let the AST injection secure the endpoints first.

  if (modified) {
    sourceFile.saveSync();
    modifiedCount++;
    console.log(`Secured endpoint: ${filePath}`);
  }
}

console.log(`Successfully injected auth validation into ${modifiedCount} remaining route files.`);
