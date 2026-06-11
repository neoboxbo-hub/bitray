# BitRay · Estrategia Cripto (PWA Mobile-First)

PWA en React + Tailwind para gestionar una estrategia de inversión cripto dividida en 3 módulos. **Fase 1: datos 100% simulados (mock)**, sin APIs reales.

## Módulos
1. **🔒 El Cofre Inmortal** — Largo plazo, solo BTC. DCA, BTC acumulado y equivalencia USD. *Sin botón de vender* + recordatorio motivacional.
2. **🌱 La Cosecha Feliz** — Mediano plazo, altcoins. Calcula precio promedio ponderado (punto de equilibrio) y PnL flotante por token.
3. **⚡ El Turbo-Ciclo** — Corto plazo. Asistente que calcula Take Profits netos (2/3/4%) y Stop Loss según riesgo parametrizable, + Mapa de liquidaciones, Fear & Greed y Noticias AI simulados.

## Comandos
```bash
npm install
npm run dev      # abre http://localhost:5173
npm run build
```
`host:true` está activo: abre `http://IP-DE-TU-PC:5173` desde el celular en la misma red Wi-Fi, o usa las DevTools (modo dispositivo) para vista móvil.

## Arquitectura
```
src/
├── main.jsx · App.jsx           # entrada + rutas
├── index.css                    # Tailwind + componentes base (.card, .field, .btn-primary)
├── context/PortfolioContext.jsx # estado global simulado (Fase 2 → Supabase/API)
├── data/mockData.js             # mercado, Coinglass, Fear&Greed, noticias (mock)
├── utils/calculations.js        # lógica financiera pura (DCA, promedio, turbo)
├── components/layout/           # MobileLayout + BottomNav
└── modules/
    ├── dashboard/               # balance total + accesos
    ├── cofre/  · cosecha/       # módulos 1 y 2
    └── turbo/                   # calculadora + widgets de decisión
```

## Fase 2 (siguiente)
Reemplazar `mockData.js` y `PortfolioContext` por Binance/Bybit (precios), Coinglass (liquidaciones) y Perplexity (noticias), y persistir compras en Supabase.
