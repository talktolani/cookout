// node render.js lock            -> lockf/000..047.png
// node render.js ov <from> <to>  -> ovf/NNNN.png (overlay layer, transparent where video shows)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [mode, a, b] = process.argv.slice(2);
  const br = await chromium.launch();
  if (mode === 'lock') {
    const p = await br.newPage({ viewport: { width: 848, height: 2000 } });
    await p.goto('file:///home/user/ed/lock.html'); await p.evaluate(() => document.fonts.ready);
    fs.mkdirSync('/home/user/ed/lockf', { recursive: true });
    for (let f = 0; f < 48; f++) { await p.evaluate(f => frame(f), f); await p.screenshot({ path: `/home/user/ed/lockf/${String(f).padStart(3, '0')}.png` }); }
  } else {
    const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('file:///home/user/ed/ov.html');
    const N = await p.evaluate(tl => init(tl), JSON.parse(fs.readFileSync('/home/user/ed/tl.json')));
    fs.mkdirSync('/home/user/ed/ovf', { recursive: true });
    for (let f = +a || 0; f < Math.min(+b || N, N); f++) {
      await p.evaluate(f => render(f), f);
      await p.screenshot({ path: `/home/user/ed/ovf/${String(f).padStart(4, '0')}.png`, omitBackground: true });
    }
    console.log('frames', N);
  }
  await br.close();
})();
