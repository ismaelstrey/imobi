import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ICONS_DIR = path.resolve('public', 'icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Certifique-se de que o diretório de ícones existe
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(ICONS_DIR, 'icon.svg'));
  
  // Gerar ícones para cada tamanho
  for (const size of SIZES) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
    
    console.log(`✅ Gerado ícone ${size}x${size}`);
  }
  
  console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(err => {
  console.error('❌ Erro ao gerar ícones:', err);
  process.exit(1);
});