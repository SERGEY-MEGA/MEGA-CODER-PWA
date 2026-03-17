import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '..', 'electron', 'assets');
const svgPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'icon.svg');

// Создаём иконку через встроенный sips
const iconsetDir = path.join(assetsDir, 'icon.iconset');
const icnsPath = path.join(assetsDir, 'icon.icns');

try {
  // Удалим старый iconset если существует
  if (fs.existsSync(iconsetDir)) {
    fs.rmSync(iconsetDir, { recursive: true });
  }
  fs.mkdirSync(iconsetDir, { recursive: true });

  // Создаём PNG временный файл из SVG
  const tempPng = path.join(assetsDir, 'temp-icon.png');
  
  // Используем built-in sips для конвертации SVG -> PNG в разных размерах
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  
  for (const size of sizes) {
    const iconPath = path.join(iconsetDir, `icon_${size}x${size}.png`);
    const icon2xPath = path.join(iconsetDir, `icon_${size}x${size}@2x.png`);
    
    try {
      // sips может конвертировать SVG
      execSync(`sips -z ${size} ${size} "${svgPath}" --out "${iconPath}" 2>/dev/null || echo "Converting ${size}"`);
      
      // Создаём @2x версию
      execSync(`sips -z ${size * 2} ${size * 2} "${svgPath}" --out "${icon2xPath}" 2>/dev/null || echo "Converting ${size}@2x"`);
    } catch (e) {
      console.warn(`Warning: Could not create ${size}x${size} icon`);
    }
  }

  // Конвертируем iconset в ICNS
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
    console.log('✓ ICNS icon created:', icnsPath);
  } catch (e) {
    console.warn('Warning: iconutil failed, creating fallback');
    // Копируем SVG как fallback
    fs.copyFileSync(svgPath, icnsPath.replace('.icns', '.svg'));
  }

  // Удалим временные файлы
  if (fs.existsSync(tempPng)) fs.unlinkSync(tempPng);

  console.log('✓ Icon preparation complete');
  
} catch (e) {
  console.error('Error:', e.message);
  // Fallback: копируем SVG напрямую
  fs.copyFileSync(svgPath, path.join(assetsDir, 'icon.icns'));
  console.log('✓ Using SVG as fallback icon');
}
