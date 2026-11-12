import { chromium, type Browser } from "playwright";

let launching: Promise<Browser> | null = null;

/** Un único Chromium compartido; se relanza si el proceso se cierra. */
export function getBrowser(): Promise<Browser> {
  launching ??= chromium.launch().then((browser) => {
    browser.on("disconnected", () => {
      launching = null;
    });
    return browser;
  }).catch((error: unknown) => {
    launching = null;
    throw error;
  });
  return launching;
}

export async function closeBrowser(): Promise<void> {
  const current = launching;
  launching = null;
  if (current) await (await current).close();
}
