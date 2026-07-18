import { expect, test, type Page } from "@playwright/test";

async function confirmAudio(page:Page) {
  await page.getByRole("button",{name:"Probar audio A/B ▶"}).click();
  await page.clock.runFor(8_000);
  await page.getByRole("button",{name:"Se oye claro"}).click();
}

test("home explains the claim and limits",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:/Escuchá un sonido/})).toBeVisible();
  await expect(page.getByText("No lee tu cerebro.")).toBeVisible();
});

test("demo hydrates from a stable participant-first intro",async({page})=>{
  const hydrationErrors:string[]=[];
  page.on("console",message=>{if(message.type()==="error"&&message.text().toLowerCase().includes("hydrat"))hydrationErrors.push(message.text());});
  await page.goto("/demo");
  await expect(page.getByRole("heading",{name:"Experiencias perceptuales"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Descubrí la forma que tienen los sonidos para vos."})).toBeVisible();
  await expect(page.getByRole("button",{name:"Entrar a la experiencia"})).toHaveCount(0);
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(hydrationErrors).toEqual([]);
});

test("demo can route Web Audio to a selected output",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator.mediaDevices,"selectAudioOutput",{configurable:true,value:async()=>({deviceId:"headphones-1",label:"Auriculares de prueba",kind:"audiooutput",groupId:"",toJSON:()=>({})})});
    Object.defineProperty(AudioContext.prototype,"setSinkId",{configurable:true,value:async function(sinkId:string){(window as typeof window&{selectedSink?:string}).selectedSink=sinkId;}});
  });
  await page.goto("/demo");
  await page.getByRole("button",{name:"Elegir parlante o auriculares"}).click();
  await expect(page.getByText("Salida elegida: Auriculares de prueba")).toBeVisible();
  expect(await page.evaluate(()=>(window as typeof window&{selectedSink?:string}).selectedSink)).toBe("headphones-1");
});

test("each laboratory exposes a genuinely different participant promise",async({page})=>{
  await page.goto("/demo");
  await page.getByRole("button",{name:/Apprenticeship/}).click();
  await expect(page.getByRole("heading",{name:"Aprendé una clave y comprobá si realmente quedó."})).toBeVisible();
  await page.getByRole("button",{name:/State Gate/}).click();
  await expect(page.getByRole("heading",{name:"Escuchá cómo el contexto cambia el mismo sonido."})).toBeVisible();
  await page.getByRole("button",{name:/Anchor/}).click();
  await expect(page.getByRole("heading",{name:"Construí una señal breve para una sensación segura."})).toBeVisible();
  await expect(page.getByText("¿Qué cualidad cómoda querés usar?")).toBeVisible();
});

test("audio confirmation unlocks a journey with an immediate contrast",async({page})=>{
  await page.clock.install();
  await page.goto("/demo");
  await confirmAudio(page);
  await expect(page.getByRole("button",{name:/Entrar a la experiencia/})).toBeVisible();
  await page.getByRole("button",{name:/Entrar a la experiencia/}).click();
  await expect(page.getByRole("heading",{name:"Dos sonidos, dos lugares"})).toBeVisible();
  await expect(page.getByText("Escuchando…")).toBeVisible();
  await page.clock.runFor(30_000);
  await expect(page.getByRole("button",{name:"El primero"})).toBeVisible();
  await page.getByRole("button",{name:"El primero"}).click();
  await expect(page.getByText("Tu elección ya cambió el recorrido: ahora vamos a explorar alrededor de ese sonido.")).toBeVisible();
});

test("a completed Atlas journey produces a concrete personal result",async({page})=>{
  await page.clock.install();
  await page.goto("/demo");
  await confirmAudio(page);
  await page.getByRole("button",{name:/Entrar a la experiencia/}).click();
  const choices=["El primero","Más cálido","Redondo","Es del mismo lugar","Sentí que faltó algo","Sí, volvió"];
  for(let index=0;index<choices.length;index+=1){
    await expect(page.getByText("Escuchando…")).toBeVisible();
    await page.clock.runFor(30_000);
    await page.getByRole("button",{name:choices[index],exact:true}).click();
    const nextName=index===choices.length-1?"Ver mi resultado →":"Seguir →";
    await page.getByRole("button",{name:nextName}).click();
  }
  await expect(page.getByText("TU PATRÓN · Atlas")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Tu mapa dejó una huella reconocible."})).toBeVisible();
  await expect(page.getByText("POR QUÉ VOLVER")).toBeVisible();
});

test("demo exposes the complete English safety path",async({page})=>{
  await page.goto("/demo");
  await page.getByRole("button",{name:"EN",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Perceptual experiences"})).toBeVisible();
  await expect(page.getByText("Comfortable volume · stop whenever you want · no correct answers")).toBeVisible();
});

test("collective learning page is honest when the backend is not connected",async({page})=>{
  await page.goto("/learning");
  await expect(page.getByRole("heading",{name:"Qué está aprendiendo UMBRAL"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Por ahora, cada dispositivo aprende por separado."})).toBeVisible();
});
