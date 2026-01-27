import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/demo/lucia/login');

    // Register
    console.log('Switching to register tab...');
    // Finding the tab button might depend on implementation. Looking at source, it's a button.
    // Assuming "Register" text is visible.
    // Wait for hydration/interactivity
    await page.waitForLoadState('networkidle');

    // Actually the login page has tabs.
    // Let's check if we can register.
    // Locate the tab button.
    const registerTab = page.locator('button', { hasText: 'Register' });
    if (await registerTab.isVisible()) {
        await registerTab.click();
    } else {
        console.log('Register tab not found, maybe already on register or different layout?');
    }

    console.log('Filling registration form...');
    const username = 'testuser_' + Date.now();
    // We need to be careful about which inputs we target if both forms are in DOM.
    // Usually only one form is visible or they share inputs?
    // In SvelteKit usually we swap forms or inputs.
    // Let's assume standard inputs.
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'password123');

    // Confirm password might only be visible in register mode.
    const confirmInput = page.locator('input[name="confirmPassword"]');
    if (await confirmInput.isVisible()) {
        await confirmInput.fill('password123');
    }

    console.log('Submitting registration...');
    // Click the submit button inside the form.
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/demo/lucia');
    console.log('Logged in/Registered.');

    // Click Notes tab
    console.log('Clicking Notes tab...');
    await page.click('button:has-text("Notes")');

    // Verify Notes tab is active and form is visible
    await page.waitForSelector('text=Personal Notes');

    // Create Note
    console.log('Creating note...');
    await page.fill('input[name="title"]', 'My First Note');
    await page.fill('textarea[name="content"]', 'This is the content of my first note.');
    await page.click('button:has-text("Add Note")');

    // Verify note appears
    console.log('Verifying note...');
    await page.waitForSelector('h3:has-text("My First Note")');
    await page.waitForSelector('p:has-text("This is the content of my first note.")');

    // Screenshot
    console.log('Taking screenshot...');
    if (!fs.existsSync('verification')) fs.mkdirSync('verification');
    await page.screenshot({ path: 'verification/notes_verification.png', fullPage: true });

    console.log('Verification successful!');
  } catch (e) {
    console.error('Verification failed:', e);
    // Take screenshot on failure
    if (!fs.existsSync('verification')) fs.mkdirSync('verification');
    await page.screenshot({ path: 'verification/failure.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
