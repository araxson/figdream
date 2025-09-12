#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

// Find all dynamic route files
const files = await glob('src/app/api/**/\\[*\\]/route.ts', { 
  cwd: '/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream'
})

console.log(`Found ${files.length} files to fix:`)
files.forEach(file => console.log(`  ${file}`))

for (const file of files) {
  const filePath = `/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/${file}`
  console.log(`\\nFixing ${file}...`)
  
  try {
    let content = await readFile(filePath, 'utf8')
    
    // Check if already fixed
    if (content.includes('params: Promise<{')) {
      console.log(`  Already fixed: ${file}`)
      continue
    }
    
    // Apply fixes
    content = content.replace(
      /interface Params \{\s*params: \{\s*id: string\s*\}\s*\}/g,
      'interface Params {\n  params: Promise<{\n    id: string\n  }>\n}'
    )
    
    // Fix function signatures - GET, POST, PATCH, PUT, DELETE
    const httpMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    
    for (const method of httpMethods) {
      const regex = new RegExp(`(export async function ${method}\\(request: NextRequest, \\{ params \\}: Params\\) \\{\\s*try \\{\\s*)(?!.*const \\{ id \\} = await params)(.*?const session = await verifyApiSession\\(request\\))`, 'gs')
      content = content.replace(regex, `$1const { id } = await params\n    $2`)
    }
    
    // Replace all params.id with id
    content = content.replace(/params\.id/g, 'id')
    
    await writeFile(filePath, content, 'utf8')
    console.log(`  ✓ Fixed: ${file}`)
  } catch (error) {
    console.error(`  ✗ Error fixing ${file}:`, error.message)
  }
}

console.log('\\nAll files processed!')