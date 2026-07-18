import { expect, test } from "@playwright/test";

test("home explains the claim and limits", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Escuchá un sonido/ })).toBeVisible();
  await expect(page.getByText("No lee tu cerebro.")).toBeVisible();
});

test("demo hydrates from a stable initial state", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && message.text().toLowerCase().includes("hydrated")) hydrationErrors.push(message.text());
  });
  await page.goto("/demo");
  await expect(page.getByRole("button", { name: "Empezar sesión" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Dejemos el audio listo" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(hydrationErrors).toEqual([]);
});

test("demo can route Web Audio to a selected output", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "selectAudioOutput", {
      configurable: true,
      value: async () => ({ deviceId: "headphones-1", label: "Auriculares de prueba", kind: "audiooutput", groupId: "", toJSON: () => ({}) }),
    });
    Object.defineProperty(AudioContext.prototype, "setSinkId", {
      configurable: true,
      value: async function (sinkId: string) {
        (window as typeof window & { selectedSink?: string }).selectedSink = sinkId;
      },
    });
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Elegir parlante o auriculares" }).click();
  await expect(page.getByText("Salida elegida: Auriculares de prueba")).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { selectedSink?: string }).selectedSink)).toBe("headphones-1");
});

test("demo is usable without Supabase", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(AudioParam.prototype, "cancelAndHoldAtTime", { configurable: true, value: undefined });
  });
  await page.goto("/demo");
  await expect(page.getByText("MODO LOCAL")).toBeVisible();
  await page.getByRole("checkbox").check();
  const start = page.getByRole("button", { name: "Empezar sesión" });
  await expect(start).toBeDisabled();
  const heard = page.getByRole("button", { name: "Sí, se escucha" });
  await expect(heard).toBeDisabled();
  await page.getByRole("button", { name: "Probar tono ▶" }).click();
  await expect(heard).toBeEnabled();
  await heard.click();
  await expect(start).toBeEnabled();
  await start.click();
  await expect(page.getByText("ANTES DEL SONIDO")).toBeVisible();
  await expect(page.getByText("Antes de escuchar, ¿esperás que aparezca algo?")).toBeVisible();
  await expect(page.getByText("SHAM", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Escuchar ▶" }).click();
  await expect(page.getByText("Escuchando…")).toBeVisible();
  await page.getByRole("button", { name: "Detener todo el audio" }).click();
  await expect(page.getByRole("heading", { name: "¿Apareció algo?" })).toBeVisible();
  await expect(page.getByText("Antes de escuchar, ¿esperás que aparezca algo?")).toHaveCount(0);
  await page.getByRole("button", { name: "No", exact: true }).click();
  await expect(page.getByText("¿Qué tan seguro estás?")).toBeVisible();
});

test("demo exposes a complete English safety path", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sound laboratory" })).toBeVisible();
  await expect(page.getByText("Your answers are stored only on this device.")).toBeVisible();
  await expect(page.getByText("I can stop at any time and will keep the volume comfortable.")).toBeVisible();
});

test("a completed session updates the personal model", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Probar tono ▶" }).click();
  await page.getByRole("button", { name: "Sí, se escucha" }).click();
  await page.getByRole("button", { name: "Empezar sesión" }).click();
  for (let trial = 0; trial < 4; trial += 1) {
    await page.getByRole("button", { name: "Escuchar ▶" }).click();
    await expect(page.getByText(/Escuchando…|Un momento…/)).toBeVisible();
    await page.getByRole("button", { name: "Detener todo el audio" }).click();
    await page.getByRole("button", { name: "No", exact: true }).click();
    await page.getByRole("button", { name: "Guardar y seguir →" }).click();
  }
  await expect(page.getByRole("heading", { name: "UMBRAL ajustó tu próxima sesión." })).toBeVisible();
  await expect(page.getByText("RESPUESTAS USADAS").locator("..").getByText("4", { exact: true })).toBeVisible();
  await expect(page.getByText("El aprendizaje colectivo todavía no está conectado. Tu modelo personal sí se actualizó.")).toBeVisible();
});

test("collective learning page is honest when the backend is not connected", async ({ page }) => {
  await page.goto("/learning");
  await expect(page.getByRole("heading", { name: "Qué está aprendiendo UMBRAL" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Por ahora, cada dispositivo aprende por separado." })).toBeVisible();
});
