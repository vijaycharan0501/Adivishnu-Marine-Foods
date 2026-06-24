import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser Error: ${msg.text()}`);
    } else {
      console.log(`Browser Log: ${msg.text()}`);
    }
  });

  // Capture uncaught exceptions
  page.on('pageerror', error => {
    console.error(`Browser PageError: ${error.message}`);
  });

  console.log('Navigating to http://localhost:5174/admin/dashboard...');
  try {
    await page.goto('http://localhost:5174/admin/dashboard', { waitUntil: 'networkidle2' });
    console.log('Page loaded. Waiting for 3 seconds to let React render...');
    await new Promise(r => setTimeout(r, 3000));
  } catch (err) {
    console.error('Failed to load page:', err);
  }

  await browser.close();
  console.log('Done.');
})();
