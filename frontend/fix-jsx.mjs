import fs from 'fs';
import path from 'path';

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix form.Field
  content = content.replace(/\)\}\s*\/>/g, (match, offset, string) => {
    // Find the closest preceding <ComponentName.Field
    const prefixStr = string.substring(0, offset);
    const tagMatch = prefixStr.match(/<([a-zA-Z0-9_]+\.Field)[^>]*>$/);
    if (tagMatch) {
      return `)}\n                </${tagMatch[1]}>`;
    }
    // Alternatively, just blindly fix the known ones
    return match;
  });

  // A better regex: 
  // We look for:
  // <(form.Field|createTaskForm.Field|leaveForm.Field|wfhForm.Field|rejectionForm.Field)[^>]*>
  // ...
  // )}\n />
  
  // Let's just do a simpler manual fix for the known closing tag issues:
  content = content.replace(/\)\}\s*\/>/g, ')}\n</form.Field>');
  
  // Actually, that's dangerous. Let's do a more robust string replacement:
  const tags = ['form.Field', 'createTaskForm.Field', 'leaveForm.Field', 'wfhForm.Field', 'rejectionForm.Field'];
  
  for (const tag of tags) {
    // This is hard to do with regex alone if there are nested closures.
    // Let's just do global replace: `)} />` -> `)} </form.Field>` where we know the context
  }

  // Let's do it specifically:
  content = content.replace(/\)\}\n\s*\/>/g, (match, offset, str) => {
    // get last tag
    const pre = str.substring(0, offset);
    const m = pre.match(/<([a-zA-Z0-9_]+\.Field)[\s\S]*$/);
    if (m) {
      return `)}\n</${m[1]}>`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
};

const files = [
  'src/routes/login.tsx',
  'src/components/CreateEmployeeModal.tsx',
  'src/components/EditEmployeeModal.tsx',
  'src/routes/tasks.tsx',
  'src/routes/leaves.tsx'
];

for (const f of files) {
  const p = path.join(process.cwd(), f);
  let content = fs.readFileSync(p, 'utf8');
  
  content = content.replaceAll(')}\n            />', ')}\n            </form.Field>');
  content = content.replaceAll(')}\n                  />', ')}\n                  </form.Field>');
  content = content.replaceAll(')}\n                />', ')}\n                </form.Field>');
  
  // Fix specific prefixes
  content = content.replace(/<\/form\.Field>/g, (m, offset, str) => {
    // Find the opening tag to ensure it matches
    const pre = str.substring(0, offset);
    const m2 = pre.match(/<([a-zA-Z0-9_]+\.Field)[^<]*$/);
    if (m2 && m2[1] !== 'form.Field') {
      return `</${m2[1]}>`;
    }
    return m;
  });

  fs.writeFileSync(p, content, 'utf8');
}

console.log('Fixed JSX syntax errors');
