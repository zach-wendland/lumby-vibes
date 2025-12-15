import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * Modular and scalable test suite for Lumby-Vibes game
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './e2e/tests',

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: 'e2e-report' }],
        ['list'],
        ...(process.env.CI ? [['github' as const]] : [])
    ],

    // Shared settings for all the projects below
    use: {
        // Base URL for navigation
        baseURL: 'http://localhost:8000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',

        // Timeout for each action
        actionTimeout: 10000,

        // Timeout for navigation
        navigationTimeout: 30000,
    },

    // Global timeout for each test
    timeout: 60000,

    // Expect timeout
    expect: {
        timeout: 10000,
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Mobile testing
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // Run local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },

    // Output folder for test artifacts
    outputDir: 'e2e-results',
});
