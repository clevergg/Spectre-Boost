// patch-telegraf.js
// Запуск: node patch-telegraf.js

const fs = require('fs');
const path = 'node_modules/nestjs-telegraf/dist/services/listeners-explorer.service.js';

let content = fs.readFileSync(path, 'utf8');

// Вариант 1: оригинальный код
const original = 'if (result) {';
// Вариант 2: сломанный предыдущим патчем
const broken = 'if (typeof result === " string\\) {';
// Вариант 3: ещё один сломанный вариант
const broken2 = 'if (typeof result === \\" string\\\\) {';

const fix = 'if (typeof result === "string") {';

if (content.includes(fix)) {
  console.log('Already patched!');
} else if (content.includes(original)) {
  content = content.replace(original, fix);
  fs.writeFileSync(path, content);
  console.log('Patched from original!');
} else {
  // Заменяем всю строку с result проверкой через regex
  const regex = /if\s*\([^)]*result[^)]*\)\s*\{/;
  const match = content.match(regex);
  if (match) {
    console.log('Found pattern:', match[0]);
    content = content.replace(regex, fix);
    fs.writeFileSync(path, content);
    console.log('Patched via regex!');
  } else {
    console.log('Pattern not found');
  }
}
