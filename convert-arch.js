#!/usr/bin/env node
/**
 * convert-arch.js
 * Convierte arquitectura.svg → arquitectura.png usando sharp (si está disponible)
 * o instrucciones manuales si no.
 * 
 * Uso: node convert-arch.js
 */

const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'arquitectura.svg');
const pngPath = path.join(__dirname, 'arquitectura.png');

console.log('🔄 Convirtiendo arquitectura.svg → arquitectura.png...\n');

// Intentar con sharp
try {
  const sharp = require('sharp');
  const svgBuffer = fs.readFileSync(svgPath);
  sharp(svgBuffer)
    .png()
    .toFile(pngPath, (err, info) => {
      if (err) {
        console.error('❌ Error con sharp:', err.message);
        showManualInstructions();
      } else {
        console.log('✅ arquitectura.png generado exitosamente!');
        console.log(`   Tamaño: ${info.width}x${info.height}px`);
      }
    });
} catch (e) {
  // Si sharp no está disponible, intentar con Inkscape CLI
  const { execSync } = require('child_process');
  try {
    execSync(`inkscape --export-type=png --export-filename="${pngPath}" "${svgPath}"`, { stdio: 'ignore' });
    console.log('✅ arquitectura.png generado con Inkscape!');
  } catch (e2) {
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('ℹ️  Opciones para generar arquitectura.png:\n');
  console.log('  OPCIÓN 1 — Instalar sharp y re-ejecutar:');
  console.log('    npm install sharp --save-dev');
  console.log('    node convert-arch.js\n');
  console.log('  OPCIÓN 2 — Usar Inkscape (si está instalado):');
  console.log(`    inkscape --export-type=png --export-filename="${pngPath}" "${svgPath}"\n`);
  console.log('  OPCIÓN 3 — Navegador (más fácil):');
  console.log('    1. Abrir arquitectura.svg en Chrome/Firefox');
  console.log('    2. Clic derecho → "Guardar imagen como" → arquitectura.png\n');
  console.log('  OPCIÓN 4 — Online:');
  console.log('    https://svgtopng.com → subir arquitectura.svg → descargar PNG');
}
