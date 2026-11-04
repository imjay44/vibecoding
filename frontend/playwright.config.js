import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 15000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    headless: true,
  },
  webServer: [
    {
      command: "cd .. && source backend/venv/bin/activate && cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000",
      url: "http://localhost:8000/api/v1/health",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "npm run dev -- --port 5173",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
