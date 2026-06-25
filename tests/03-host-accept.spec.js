import { test, expect } from '@playwright/test';
import { waitForAppReady, hasSupabase } from './helpers.js';

// TEST 3 — Host → Requests → Accept booking
//
// Richiede un account host autenticato con almeno una richiesta pending.
// In CI: settare E2E_HOST_STORAGE_STATE puntando a un JSON di sessione
// pre-generato via `npx playwright codegen --save-storage`.
//
// Senza credenziali: smoke render della redirect/login gate del backoffice.
test.describe('Host accept flow', () => {
  test('host backoffice route exists', async ({ page }) => {
    await page.goto('/noleggia');
    await waitForAppReady(page);
    // O dashboard (se authed) o redirect alla home/auth modal
    const onDashboard = await page.getByText(/dashboard|panoramica|veicoli|richieste/i).first().isVisible().catch(() => false);
    const onLandingGate = await page.getByText(/accedi|registr/i).first().isVisible().catch(() => false);
    expect(onDashboard || onLandingGate).toBeTruthy();
  });

  test.skip(!hasSupabase || !process.env.E2E_HOST_STORAGE_STATE, 'Richiede host auth state in env');
  test('host can accept a pending request', async ({ page }) => {
    await page.goto('/noleggia/richieste');
    await waitForAppReady(page);
    // Filtra su tab "In attesa" se presente
    const pendingTab = page.getByRole('button', { name: /in attesa|pending/i }).first();
    if (await pendingTab.isVisible().catch(() => false)) {
      await pendingTab.click();
    }
    // Trova un button "Accetta"
    const acceptBtn = page.getByRole('button', { name: /accetta|accept/i }).first();
    await acceptBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await acceptBtn.click();
    // Conferma dialog
    const confirmBtn = page.getByRole('button', { name: /conferma|confirm/i }).first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }
    // Aspetta toast di successo o stato aggiornato
    await expect(page.getByText(/accettata|confermata|success/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
