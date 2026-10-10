import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Fallback safety: If dist does not exist, build it automatically
if (!fs.existsSync(indexPath)) {
  console.log('⚠️ Pasta dist não encontrada. Executando build de produção...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Build concluído com sucesso!');
  } catch (err) {
    console.error('Falha ao executar build:', err);
  }
}

// Serve static assets from dist
app.use(express.static(distPath));

// SPA fallback: any route goes to dist/index.html
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Erro: O build de produção (dist) não foi gerado.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Treino Full Body rodando na porta ${PORT}`);
});
