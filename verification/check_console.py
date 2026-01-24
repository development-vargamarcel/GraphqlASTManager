
from playwright.sync_api import sync_playwright

def check_console_logs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

        try:
            page.goto("http://localhost:5173/")

            # Click the Authentication card
            # Use a locator that finds the link containing the text "Authentication" inside the grid
            page.locator("a[href='/demo/lucia']").first.click()
            page.wait_for_url("**/demo/lucia/login")

            page.goto("http://localhost:5173/")
            page.locator("a[href='/demo/paraglide']").first.click()
            page.wait_for_url("**/demo/paraglide")

            print("Console Messages:")
            for msg in console_messages:
                print(msg)

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    check_console_logs()
