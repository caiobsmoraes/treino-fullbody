import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // Simple uncompressed RGBA pixel buffer
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.45 : width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter byte: 0 = None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Dark Slate #0f172a
      let r = 15, g = 23, b = 42, a = 255;

      // Outer border circle
      if (Math.abs(dist - radius) < (width > 200 ? 5 : 2)) {
        r = 56; g = 189; b = 248; // Cyan accent
      } else if (dist < radius) {
        // Inner circle background: deep navy #090d16
        r = 9; g = 13; b = 22;

        // Dumbbell shape in center
        // Transform coordinates with 45 deg rotation
        const cos = 0.7071;
        const sin = 0.7071;
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;

        // Barbell bar
        if (Math.abs(ry) <= width * 0.04 && Math.abs(rx) <= width * 0.28) {
          r = 226; g = 232; b = 240; // Slate bar
        }
        // Left plates
        else if (rx >= -width * 0.28 && rx <= -width * 0.22 && Math.abs(ry) <= width * 0.20) {
          r = 16; g = 185; b = 129; // Emerald plate
        }
        else if (rx >= -width * 0.35 && rx <= -width * 0.29 && Math.abs(ry) <= width * 0.14) {
          r = 16; g = 185; b = 129; // Emerald outer plate
        }
        // Right plates
        else if (rx >= width * 0.22 && rx <= width * 0.28 && Math.abs(ry) <= width * 0.20) {
          r = 16; g = 185; b = 129; // Emerald plate
        }
        else if (rx >= width * 0.29 && rx <= width * 0.35 && Math.abs(ry) <= width * 0.14) {
          r = 16; g = 185; b = 129; // Emerald outer plate
        }
        // Center accent spark
        else if (Math.abs(rx) <= width * 0.03 && Math.abs(ry) <= width * 0.03) {
          r = 245; g = 158; b = 11; // Amber center
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT data
  const compressed = zlib.deflateSync(rawData);

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const len = data.length;
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(len, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('PWA icons successfully generated in /public!');
