# Redondo Frontend

App do Redondo Stats em Expo + React Native + TypeScript. Um código só para **web, Android e iOS**.

## Rodar

```bash
npm install
npm run web      # web em http://localhost:3000
npm start        # dev server (a = Android, i = iOS, w = web)
```

O backend precisa estar rodando na porta **3001** (`project-x-backend`).

## Ambiente

| Arquivo | Quando é usado |
|---|---|
| `.env` | desenvolvimento (`npm run web`, `npm start`) |
| `.env.production` | build (`npm run build:web`, EAS Build) |

Variáveis precisam do prefixo `EXPO_PUBLIC_` para chegarem ao app. Veja `.env.example`.

No celular físico, `localhost` é resolvido automaticamente para o IP da máquina
(`resolveBaseUrl` em `lib/api.ts`).

## Build

```bash
npm run build:web    # gera dist/
npm run serve:web    # serve dist/ na 3000
```

Mobile usa EAS Build (necessário porque iOS não compila no Windows):

```bash
npx eas build --platform android --profile preview
npx eas build --platform ios --profile production
```

## Estrutura

```
app/                  rotas (expo-router, file-based como o App Router do Next)
  (tabs)/             tab bar no mobile, sidebar no desktop
  game/[slug].tsx     detalhe da partida
components/
  entity-image.tsx    TeamImage/PlayerImage/LeagueImage com fallback
  game-card.tsx       card de partida
  ui.tsx              Panel, Chip, Score, Segmented, StatTile
context/context.tsx   AppContext (user, tema, loading) — porte do project-x
lib/
  api.ts              axiosGet/axiosPost — mesma assinatura do project-x
  games.ts            hooks das rotas /games_stats e /ai_performance
  storage.ts          localStorage (web) / SecureStore (native)
public/img/           logos de times, ligas, jogadores e mapas (servido no web)
```

## Imagens

As imagens (times, ligas, jogadores, mapas) moram **no backend**, em
`project-x-backend/img/`, servidas pela rota `/img/...`. Web e app usam a mesma
origem, e o bundle do front não carrega nenhuma imagem.

`components/entity-image.tsx` monta `<EXPO_PUBLIC_IMAGES_URL>/img/imgs/<tipo>/<img_url>`
e cai num ícone quando não há imagem ou o carregamento falha.

Depois de baixar imagens novas, rode a otimização no backend:

```bash
python script/download_imgs.py
python script/optimize_imgs.py   # reduz ~77%
```

## Reaproveitado do project-x

`lib/api.ts` e `context/context.tsx` mantêm a mesma assinatura do piloto Next.js,
então o código de tela é copiável entre os dois projetos:

```ts
axiosGet(`/games_stats/game?slug=${slug}`, (data) => setGame(data), onError, true);
```

Duas diferenças:

1. O Next faz rewrite de `/api/*` via `next.config.ts`; aqui a URL absoluta é
   montada a partir de `EXPO_PUBLIC_BACKEND_URL`.
2. O backend (`token_service_required`) exige `Origin` **ou** `Referer` igual a
   `FRONTEND_URL`. No web o browser envia `Origin` sozinho; no app nativo não
   existe `Origin`, então `lib/api.ts` envia o `Referer` explicitamente a partir
   de `EXPO_PUBLIC_FRONTEND_URL`. Sem isso, o app nativo toma 403.

## Tema

Dark-first, tokens em `global.css` e `tailwind.config.js`, seguindo o design de
referência. O toggle está no cabeçalho (mobile) e no rodapé da sidebar (desktop).
