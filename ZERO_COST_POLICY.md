# Zero Cost Policy

**Presupuesto operativo máximo:** USD 0 por mes.

## Servicios y límites verificados (2026-07-17)

- Vercel Hobby: aplicación Next.js personal y no comercial; sin Pro Trial ni add-ons. La documentación vigente incluye 100 GB de transferencia rápida, 1 millón de edge requests y límites mensuales de cómputo. Al alcanzar el límite, el proyecto puede pausarse; Hobby no compra capacidad adicional. Ver [plan Hobby](https://vercel.com/docs/plans/hobby) y [fair use](https://vercel.com/docs/limits/fair-use-guidelines).
- Supabase Free: autenticación y una base compacta; 2 proyectos activos, 500 MB de base y 5 GB de egress según la página vigente. Puede pausarse por inactividad y la ventana de restauración puede cambiar. Sin Storage, Realtime, Edge Functions, Branching, PITR ni add-ons. Ver [pricing](https://supabase.com/pricing) y [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).
- GitHub Free: repositorio público y Actions moderadas.
- Navegador: audio, análisis, adaptación, gráficos, exportación y demo local.

Los límites pueden cambiar y se revisan en documentación oficial antes de cada lanzamiento. UMBRAL no configura facturación automática ni requiere tarjeta. CI evita Playwright completo en cada commit y no conserva artefactos grandes. Los estímulos se guardan como semillas, no audio.

Vercel Hobby sólo es válido mientras el despliegue sea personal y no comercial según sus términos. Si el proyecto pasa a ser institucional, financiado o comercial, no se habilitará un plan pago: se migrará a alojamiento estático/comunitario o autoalojado que mantenga USD 0 para UMBRAL hasta que exista una decisión de gobernanza compatible con esta política.

## Prohibido por costo

APIs comerciales de IA/audio/analytics/email, Vercel Blob, bases vectoriales pagas, modelos alojados, cron jobs, add-ons y cualquier capacidad que consuma créditos pagos.

## Si se alcanza una cuota

No contratar capacidad ni degradar privacidad. Mostrar un mensaje claro, detener sincronización con reintento explícito, conservar el modo local, permitir exportar y explicar cuándo el servicio podría reanudarse. No hacer reintentos automáticos agresivos ni generar actividad artificial para evitar la pausa de un proyecto gratuito.

## Migración abierta

La aplicación puede autoalojarse con Node.js y Postgres/Supabase open source. IndexedDB conserva el flujo principal sin servidor. Las migrations SQL y el formato JSON evitan encierro.
