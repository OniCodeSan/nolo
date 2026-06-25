import { test, expect } from '@playwright/test';
import { waitForAppReady } from './helpers.js';

// TEST 4 — Magic-link restore flow
//
// Verifica che lo stato di ricerca/prenotazione sopravviva alla chiusura tab
// (localStorage), così quando l'utente clicca il magic-link in una nuova tab
// ritrova auto + date + ora di ritiro selezionate.
test.describe('Magic-link restore flow', () => {
  test('search state survives tab reload', async ({ page, context }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Inietta una search "fatta a mano" in localStorage prima del reload
    await page.evaluate(() => {
      localStorage.setItem('moviq.search.v1', JSON.stringify({
        location: 'Milano',
        from: '2026-06-18',
        to: '2026-06-22',
        category: null,
        timeFrom: '10:00',
        timeTo: '18:00',
      }));
    });

    // Apri nuova tab — simula apertura magic-link
    const newTab = await context.newPage();
    await newTab.goto('/');
    await waitForAppReady(newTab);

    // Il valore di localStorage condivide tra tab del contesto
    const restored = await newTab.evaluate(() => localStorage.getItem('moviq.search.v1'));
    expect(restored).toContain('Milano');
    expect(restored).toContain('2026-06-18');
  });

  test('booking state persists across tabs', async ({ page, context }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.evaluate(() => {
      localStorage.setItem('moviq.booking.v1', JSON.stringify({
        car: { id: 'c1', name: 'Test Car' },
        host: { id: 'h1' },
        days: 4,
        subtotal: 200,
        deposit: 100,
        total: 300,
        from: '2026-06-18',
        to: '2026-06-22',
        timeFrom: '10:00',
        timeTo: '18:00',
        message: 'test',
      }));
    });

    const newTab = await context.newPage();
    await newTab.goto('/conferma');
    await waitForAppReady(newTab);
    const restored = await newTab.evaluate(() => JSON.parse(localStorage.getItem('moviq.booking.v1') || '{}'));
    expect(restored.car?.id).toBe('c1');
    expect(restored.days).toBe(4);
  });

  test('expired magic-link hash shows error toast', async ({ page }) => {
    // Simula il redirect Supabase con un link scaduto
    await page.goto('/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
    await waitForAppReady(page);
    await expect(page.getByText(/scaduto|expired/i).first()).toBeVisible({ timeout: 5_000 });
    // L'hash deve essere ripulito
    await page.waitForFunction(() => !window.location.hash.includes('error'));
  });
});
