import { chromium } from 'playwright';

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
	page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

	const username = 'user_' + Math.floor(Math.random() * 10000);

	console.log('Registering user:', username);

	// Register
	await page.goto('http://localhost:5174/demo/lucia/login');

	// Wait for network idle to ensure scripts loaded
	await page.waitForLoadState('networkidle');

	await page.click('button[data-testid="register-tab"]');

	// Wait for UI to update (Title changes)
	await page.waitForSelector('h1:has-text("Create an Account")');

	await page.fill('input[name="username"]', username);
	await page.fill('input[name="password"]', 'password123');
	await page.fill('input[name="confirmPassword"]', 'password123');
	await page.click('button[type="submit"]');

	// Wait for navigation
	await page.waitForURL('**/demo/lucia');
	console.log('Logged in');

	// Go to Notes tab
	await page.click('button:has-text("Notes")');

	// Create notes
	await page.fill('input[name="title"]', 'Groceries');
	await page.fill('textarea[name="content"]', 'Milk, Bread, Eggs');
	await page.click('button:has-text("Add Note")');
	await page.waitForSelector('h3:has-text("Groceries")');

	await page.fill('input[name="title"]', 'Meeting');
	await page.fill('textarea[name="content"]', 'Discuss Q3 goals');
	await page.click('button:has-text("Add Note")');
	await page.waitForSelector('h3:has-text("Meeting")');

	await page.fill('input[name="title"]', 'Ideas');
	await page.fill('textarea[name="content"]', 'App idea: search feature');
	await page.click('button:has-text("Add Note")');
	await page.waitForSelector('h3:has-text("Ideas")');

	console.log('Notes created');

	// Search
	await page.fill('input[placeholder="Search notes..."]', 'goals');

	// Wait a bit for UI update
	await page.waitForTimeout(500);

	// Screenshot
	await page.screenshot({ path: 'verification/search_notes.png', fullPage: true });
	console.log('Screenshot taken');

	await browser.close();
})();
