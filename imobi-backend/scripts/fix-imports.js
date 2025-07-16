const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos .ts em um diretório
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (path.extname(file) === '.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Função para converter imports com alias para caminhos relativos
function convertImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const srcDir = path.resolve(__dirname, '../src');
  const fileDir = path.dirname(filePath);
  
  // Regex para encontrar imports com alias
  const aliasRegex = /from\s+['"](@[^/]+\/[^'"]+)['"];/g;
  
  let newContent = content.replace(aliasRegex, (match, alias) => {
    // Ignorar imports do @prisma/client e outros pacotes externos
    if (alias.startsWith('@prisma/') || alias.startsWith('@types/')) {
      return match;
    }
    
    const aliasPath = alias.substring(1); // Remover o @ inicial
    const parts = aliasPath.split('/');
    const targetDir = path.join(srcDir, parts[0]);
    const targetPath = path.join(targetDir, ...parts.slice(1));
    
    // Calcular caminho relativo
    let relativePath = path.relative(fileDir, targetPath);
    
    // Garantir que o caminho comece com ./ ou ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    
    // Substituir barras invertidas por barras normais para compatibilidade
    relativePath = relativePath.replace(/\\/g, '/');
    
    return `from "${relativePath}";`;
  });
  
  // Salvar o arquivo modificado
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Convertido: ${filePath}`);
    return true;
  }
  
  return false;
}

// Diretório principal
const srcDir = path.resolve(__dirname, '../src');

// Encontrar todos os arquivos .ts
const tsFiles = findTsFiles(srcDir);

// Converter imports em cada arquivo
let convertedCount = 0;
tsFiles.forEach(file => {
  if (convertImports(file)) {
    convertedCount++;
  }
});

console.log(`Conversão concluída. ${convertedCount} arquivos foram modificados.`);