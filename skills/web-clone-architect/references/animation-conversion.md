# Animation & 3D Conversion Guide

This guide details how to translate raw cloned web animations, CSS keyframes, Webflow interactions, and WebGL canvases into modern declarative React / Vue / Svelte animations.

---

## 1. CSS Keyframe & Scroll Reveal -> Framer Motion

### Before (Raw Cloned HTML / Webflow / AOS):
```html
<div class="fade-in-up" data-aos="fade-up" data-aos-delay="200">
  <h2>Discover Our Platform</h2>
</div>
```

### After (Declarative Framer Motion Component):
```tsx
'use client';
import { motion } from 'framer-motion';

export function FadeUpSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 2. Staggered Grid Animations

### After (Parent + Children Variants):
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((item, idx) => (
        <motion.div key={idx} variants={itemVariants} className="p-6 rounded-2xl bg-card border">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 3. Interactive Accordion / FAQ State

### After (Animated Height with Framer Motion):
```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-medium text-foreground py-2"
      >
        <span>{question}</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-2 pb-3 text-muted-foreground text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 4. 3D Spline Embed -> React Spline Wrapper

### After (Safe Offline / Dynamic Spline Component):
```tsx
'use client';
import Spline from '@splinetool/react-spline';

export function SplineScene({ sceneUrl }: { sceneUrl: string }) {
  return (
    <div className="w-full h-[500px] relative">
      <Spline scene={sceneUrl || '/assets/3d/scene.splinecode'} />
    </div>
  );
}
```

---

## 5. Three.js / GLTF Model -> React Three Fiber (R3F)

### After (R3F `<Canvas>` + `@react-three/drei`):
```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Float } from '@react-three/drei';

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={1.5} />;
}

export function ThreeDViewer({ modelPath = '/assets/3d/model.glb' }: { modelPath?: string }) {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <Model modelPath={modelPath} />
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}
```
