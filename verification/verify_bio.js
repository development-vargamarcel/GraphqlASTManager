import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/demo/lucia/login');

    // Wait for hydration
    await page.waitForTimeout(2000);

    // Register a new user
    console.log('Switching to register tab...');
    await page.click('[data-testid="register-tab"]');

    // Wait for the header to change to verify switch
    await page.waitForSelector('h1:has-text("Create an Account")');

    const username = 'user_' + Math.floor(Math.random() * 10000);
    console.log(`Registering user: ${username}`);

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'password123');

    // Wait for confirm password field
    await page.waitForSelector('input[name="confirmPassword"]');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Click register button (ensure we click the one inside the form)
    // The button text changes to "Register"
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    console.log('Waiting for dashboard...');
    await page.waitForURL('**/demo/lucia');

    // Check for Bio field
    console.log('Checking for Bio field...');
    const bioLabel = page.getByLabel('Bio');
    await bioLabel.waitFor();

    // Update Bio
    console.log('Updating Bio...');
    await bioLabel.fill('This is a test bio from playwright.');
    await page.click('button:has-text("Save Changes")');

    // Verify Toast or Success
    console.log('Waiting for success message...');
    // The toast might appear, but verifying text content of bio persistence is better.
    // Wait a bit or reload to verify persistence.
    // Or just check if the value remains after some time (if SPA) or if toast appears.
    // Let's look for "Profile updated successfully" toast.
    await page.waitForSelector('text=Profile updated successfully', { timeout: 5000 });

    // Take Screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'verification/bio_feature.png' });
    console.log('Screenshot saved to verification/bio_feature.png');

  } catch (e) {
    console.error('Error during verification:', e);
    await page.screenshot({ path: 'verification/error.png' });
  } finally {
    await browser.close();
  }
})();
