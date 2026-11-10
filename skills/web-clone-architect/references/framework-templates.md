# Framework Templates & Architecture Patterns

This reference provides idiomatic boilerplate architectures for converting cloned websites into modern component frameworks.

---

## 1. Next.js 15 (App Router + React 19 + TypeScript + Tailwind)

### Recommended Directory Structure
```text
my-app/
├── app/
│   ├── layout.tsx         # Root layout with custom font imports & ThemeProvider
│   ├── page.tsx           # Home page assembling all section components
│   ├── globals.css        # Tailwind directives + design token CSS variables
│   └── (routes)/...       # Subpages (e.g., /pricing, /about)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx     # Responsive navigation with mobile menu state
│   │   └── Footer.tsx     # Site footer & legal links
│   ├── sections/
│   │   ├── Hero.tsx       # Hero banner with Framer Motion entrance
│   │   ├── Features.tsx   # Feature grid cards
│   │   ├── Pricing.tsx    # Pricing matrix with monthly/annual toggle
│   │   ├── Testimonials.tsx # Social proof / review cards
│   │   └── Faq.tsx        # Accordion with expand/collapse state
│   ├── ui/
│   │   ├── Button.tsx     # Accessible button variants (primary, ghost, outline)
│   │   ├── Card.tsx       # Styled container with border glow & hover
│   │   └── ThemeToggle.tsx # Dark/light mode switcher
│   └── 3d/
│       └── CanvasScene.tsx # React Three Fiber or Spline 3D wrapper
├── public/
│   ├── assets/            # Converted images, fonts, 3D models (.glb)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Essential Dependencies
```bash
npm install framer-motion lucide-react clsx tailwind-merge next-themes
# If 3D is needed:
npm install three @react-three/fiber @react-three/drei
```

---

## 2. Vite + React (TypeScript + Tailwind + Shadcn UI)

### Recommended Directory Structure
```text
my-react-app/
├── src/
│   ├── App.tsx            # Main application mounting sections
│   ├── main.tsx           # Entrypoint mounting DOM root
│   ├── index.css          # Tailwind base/components/utilities
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   └── Footer.tsx
│   └── lib/
│       └── utils.ts       # cn() helper for class merging
├── public/
├── tailwind.config.js
└── package.json
```

### Essential Dependencies
```bash
npm install lucide-react framer-motion clsx tailwind-merge
```

---

## 3. Nuxt 3 / Vue 3 (Script Setup + Tailwind)

### Component Pattern (`Hero.vue`)
```vue
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  headline?: string
  subheadline?: string
}>()

const isAnnual = ref(false)
</script>

<template>
  <section class="relative py-24 bg-background text-foreground overflow-hidden">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-5xl font-bold tracking-tight">
        {{ headline || 'Rapidly Build Modern Interfaces' }}
      </h1>
      <!-- Slot or child content -->
      <slot />
    </div>
  </section>
</template>
```

---

## 4. Svelte 5 / SvelteKit (Modern Runes + Tailwind)

### Component Pattern (`Pricing.svelte`)
```svelte
<script lang="ts">
  // Svelte 5 Runes for fine-grained reactivity
  let isYearly = $state(false);

  let proPrice = $derived(isYearly ? 190 : 19);
</script>

<div class="p-8 rounded-2xl bg-card border border-border">
  <button onclick={() => isYearly = !isYearly} class="btn-toggle">
    {isYearly ? 'Billed Annually' : 'Billed Monthly'}
  </button>
  <p class="text-4xl font-bold">${proPrice}</p>
</div>
```

---

## 5. Astro 5 (Island Architecture)

### Astro Page (`index.astro`)
```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.tsx';
import Hero from '../components/Hero.astro';
import PricingCalculator from '../components/PricingCalculator.tsx';
import Footer from '../components/Footer.astro';
---

<Layout title="Cloned Experience">
  <!-- Static by default (Zero JS shipped to client) -->
  <Navbar client:load />
  <Hero />
  <!-- Interactive React Island with client-side hydration -->
  <PricingCalculator client:visible />
  <Footer />
</Layout>
```
