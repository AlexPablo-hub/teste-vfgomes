import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para os testes E2E.
 *
 * - `webServer` faz `npm run preview` (Vite serve o build de produção em :4173).
 *   Pra rodar local sem build prévio, basta `npm run build` antes ou usar
 *   `reuseExistingServer` rodando `npm run dev` numa aba e disparar os testes.
 * - 1 projeto chromium-only — suficiente para o escopo do projeto, e o
 *   CI fica mais rápido (não precisa baixar Firefox/WebKit).
 * - Em CI: 2 retries, sem `forbidOnly`, screenshots/videos só em falha.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
