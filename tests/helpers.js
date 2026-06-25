// Helper condivisi per Playwright e2e.
// Tutti i test girano contro la build prod servita da Vite preview (vedi playwright.config.js).
// Se non sono settate le env Supabase l'app va in modalità proto-data (offline mock).

export const hasSupabase = Boolean(
  process.env.E2E_SUPABASE_URL && process.env.E2E_SUPABASE_ANON_KEY
);

// Aspetta che React abbia montato l'app (root non vuota).
export async function waitForAppReady(page) {
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.children.length > 0;
  });
}

// Click sul primo elemento testuale visibile che match una regex.
// Fallback robusto quando i bottoni non hanno aria-label coerente.
export async function clickText(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}
