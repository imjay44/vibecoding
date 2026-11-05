import { test, expect } from "@playwright/test";

test.describe("HomeServe Technologies Full SaaS Platform E2E Suite", () => {
  test("1. Public Homepage renders hero, dynamic categories, stats and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HomeServe Technologies/);

    // Hero headline
    await expect(page.locator("h1")).toContainText("Your Home, Our Responsibility");

    // Dynamic categories section
    await expect(page.locator("text=Popular Service Categories")).toBeVisible();

    // Platform statistics
    await expect(page.locator("text=25,000+")).toBeVisible();
    await expect(page.locator("text=Completed Bookings")).toBeVisible();

    // Footer
    await expect(page.locator("footer")).toContainText("HomeServe Technologies Pvt. Ltd.");
  });

  test("2. Service Catalog browsing and keyword search", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("h1")).toContainText("Explore All Home Services");

    // Wait for services to appear
    await expect(page.locator("text=Ceiling Fan Installation").first()).toBeVisible({ timeout: 10000 });

    // Search bar functionality
    const searchInput = page.locator("input[placeholder='Search services...']");
    await searchInput.fill("Fan");
    await page.waitForTimeout(600);

    // Filtered card visible
    await expect(page.locator("text=Ceiling Fan Installation").first()).toBeVisible();
  });

  test("3. Customer Authentication & Dashboard Access", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h2")).toContainText("Sign In to Your Portal");

    // Click 1-Click Customer Demo Pill
    await page.locator("button:has-text('Customer')").click();
    await page.locator("button[type='submit']").click();

    // Redirect to Customer Dashboard
    await page.waitForURL("**/customer", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Hello, Rahul");
    await expect(page.locator("text=Total Bookings").first()).toBeVisible();
  });

  test("4. Service Provider Dashboard & Verification Status", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button:has-text('Provider')").click();
    await page.locator("button[type='submit']").click();

    await page.waitForURL("**/provider", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/Apex Home Solutions|Service Contractor Portal/);
    await expect(page.locator("text=Incoming Requests").first()).toBeVisible();
    await expect(page.locator("text=Net Earnings").first()).toBeVisible();
  });

  test("5. Technician Workforce Portal & Job Assignments", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button:has-text('Technician')").click();
    await page.locator("button[type='submit']").click();

    await page.waitForURL("**/technician", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Technician Workspace: Amit Verma");
    await expect(page.locator("text=Jobs Assigned to You").first()).toBeVisible();
  });

  test("6. Super Admin Governance Dashboard & KPIs", async ({ page }) => {
    await page.goto("/login");
    await page.locator("button:has-text('Super Admin')").click();
    await page.locator("button[type='submit']").click();

    await page.waitForURL("**/admin", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Platform Executive Oversight");
    await expect(page.locator("text=Total Revenue Settled").first()).toBeVisible();
  });

  test("7. Mobile Viewport Responsiveness without Horizontal Scroll", async ({ page }) => {
    // Mobile Viewport (iPhone SE: 375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify hamburger menu button is visible
    const menuBtn = page.locator("header button");
    await expect(menuBtn.last()).toBeVisible();

    // Check no horizontal scrollbar on document
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("8. Floating RAG Chatbot (ragbased.pdf & Static Fallback)", async ({ page }) => {
    test.setTimeout(45000);
    await page.goto("/");

    // 1. Check floating chatbot trigger is visible on bottom-right
    const triggerBtn = page.locator("button[aria-label='Open HomeServe AI Policy Assistant']");
    await expect(triggerBtn).toBeVisible();

    // 2. Open Chatbot
    await triggerBtn.click();
    await expect(page.locator("text=HomeServe AI").first()).toBeVisible();
    await expect(page.locator("text=ragbased.pdf").first()).toBeVisible();

    // 3. Ask in-PDF question (Plumbing Warranty)
    const chatInput = page.locator("input[placeholder='Ask about warranty, hours, cancellation...']");
    await chatInput.fill("What is the warranty period for plumbing?");
    await page.locator("button[title='Send message']").click();

    // 4. Expect accurate policy response from PDF
    await expect(page.locator("text=/30[- ]?days?|workmanship/i").first()).toBeVisible({ timeout: 20000 });

    // 5. Ask out-of-PDF question (Static Fallback test)
    await chatInput.fill("Who wrote the play Hamlet?");
    await page.locator("button[title='Send message']").click();

    // 6. Expect exact static fallback response
    await expect(page.locator("text=I am sorry, but I can only answer questions related to the HomeServe company policies").first()).toBeVisible({ timeout: 15000 });

    // 7. Close Chatbot
    await page.locator("button[title='Close chat']").click();
    await expect(page.locator("button[aria-label='Open HomeServe AI Policy Assistant']")).toBeVisible();
  });
});
