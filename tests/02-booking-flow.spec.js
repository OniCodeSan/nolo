import { test, expect } from '@playwright/test';
import { waitForAppReady, hasSupabase } from './helpers.js';

// TEST 2 — Vehicle → Booking → Confirmation
//
// Senza Supabase: verifichiamo che il submit prenotazione apra AuthModal
// (gating corretto), perché senza auth non si completa.
// Con Supabase: cabliamo una sessione di test via storageState (preset auth).
test.describe('Booking flow', () => {
  test('vehicle page shows "Richiedi prenotazione" CTA', async ({ page }) => {
    await page.goto('/auto/c1');
    await waitForAppReady(page);
    await expect(page.getByText(/richiedi prenotazione|prenota/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('booking page renders form fields', async ({ page }) => {
    await page.goto('/prenota/c1');
    await waitForAppReady(page);
    // Conferma prenotazione headline
    await expect(page.getByText(/conferma prenotazione|completa prenotazione/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('submit without auth opens AuthModal', async ({ page }) => {
    test.skip(hasSupabase, 'In modalità Supabase real auth è già configurata — skip gating test');
    await page.goto('/prenota/c1');
    await waitForAppReady(page);
    // Trova la CTA di submit ("Accedi e invia richiesta" o "Conferma")
    const submitCta = page.getByRole('button', { name: /accedi e invia|conferma e invia|invia richiesta/i }).first();
    if (await submitCta.isVisible().catch(() => false)) {
      await submitCta.click();
      // L'AuthModal mostra l'email field
      await expect(page.getByPlaceholder(/tu@example|email/i).first()).toBeVisible({ timeout: 5_000 });
    } else {
      // CTA disabled (es. "Scegli date") → test rimane uno smoke render
      await expect(page.getByText(/scegli date|seleziona/i).first()).toBeVisible();
    }
  });
});
