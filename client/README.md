# evoke-application

EVOKE is a voice-driven multi-agent AI platform that turns spoken ideas into
full-stack applications.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- lucide-react icons

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:8080.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build

## Project structure

```
src/
  assets/logo.png
  components/
    layout/      Navbar, Footer
    sections/    Hero, VoiceStudio, Workflow, AgentArchitecture, Features, DemoPreview
    ui/          Button, Card, SectionTitle
  data/          features, agents, workflow
  App.tsx
  main.tsx
  index.css
```
