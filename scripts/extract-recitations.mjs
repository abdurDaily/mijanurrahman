// Turns Mijan's Facebook recitation videos into audio for the "Featured Recitation"
// player: downloads each video from Facebook's public embed and extracts the
// soundtrack to assets/audio/recitations/<video id>.m4a (AAC — plays in every browser).
// Run: npm run recitations            (existing files are skipped)
//      npm run recitations -- <id>…   (only these ids)
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { VIDEOS } from '../js/data.js';

const OUT = 'assets/audio/recitations';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const wanted = process.argv.slice(2);
const ids = wanted.length ? wanted
  : VIDEOS.filter((v) => v.kind === 'recitation' && v.platform === 'facebook').map((v) => v.id);

/** Direct video file URL from Facebook's embed page (prefers HD for better audio). */
async function videoUrl(id) {
  const href = encodeURIComponent(`https://www.facebook.com/reel/${id}`);
  const html = await (await fetch(`https://www.facebook.com/plugins/video.php?href=${href}`, { headers: { 'user-agent': UA } })).text();
  const m = html.match(/"hd_src":"([^"]+)"/) ?? html.match(/"sd_src":"([^"]+)"/);
  if (!m) throw new Error('no video URL in embed page (video private or removed?)');
  return JSON.parse(`"${m[1]}"`); // unescape \/ and %
}

const run = (args) => new Promise((resolve, reject) => {
  const p = spawn(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = '';
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.split('\n').slice(-4).join('\n')))));
});

await mkdir(OUT, { recursive: true });
for (const id of ids) {
  const out = path.join(OUT, `${id}.m4a`);
  if (existsSync(out) && !wanted.length) { console.log('•', id, 'exists'); continue; }
  const tmp = path.join(os.tmpdir(), `recitation-${id}.mp4`);
  try {
    const res = await fetch(await videoUrl(id), { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
    await writeFile(tmp, Buffer.from(await res.arrayBuffer()));
    // Copy the AAC track as-is when possible (no quality loss); re-encode otherwise.
    await run(['-y', '-i', tmp, '-vn', '-c:a', 'copy', '-movflags', '+faststart', out])
      .catch(() => run(['-y', '-i', tmp, '-vn', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]));
    console.log('✓', id, '→', out);
  } catch (err) {
    console.error('✗', id, err.message);
    process.exitCode = 1;
  } finally {
    await rm(tmp, { force: true });
  }
}
