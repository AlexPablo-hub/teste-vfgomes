import type { Variants, Transition } from 'framer-motion'

/**
 * Easing padrão NOIR LUXE — "luxury ease-out" sem overshoot.
 * Equivalente ao cubic-bezier(0.16, 1, 0.3, 1) das nossas animações CSS.
 */
export const easeLuxe: Transition['ease'] = [0.16, 1, 0.3, 1]

/* ========================================================================
 * VARIANTES BÁSICAS (use direto em motion.div initial/animate)
 * Durações calibradas para uma cadência luxo: lentas o suficiente para
 * serem percebidas, rápidas o suficiente para não atrapalhar o uso.
 * ======================================================================== */

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLuxe } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: easeLuxe } },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: easeLuxe } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.1, ease: easeLuxe } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.1, ease: easeLuxe } },
}

export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: easeLuxe } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.0, ease: easeLuxe } },
}

/* ========================================================================
 * STAGGER — container + item
 * staggerChildren = delay entre cada filho (em segundos).
 * delayChildren   = delay antes de iniciar o primeiro filho.
 * ======================================================================== */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

/** Cascata mais lenta — bom para grids grandes (catálogo). */
export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLuxe } },
}

export const staggerItemFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: easeLuxe } },
}

/* ========================================================================
 * REVEAL ON SCROLL — usado com whileInView
 * ======================================================================== */

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.3, ease: easeLuxe } },
}

export const revealZoom: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.3, ease: easeLuxe } },
}

/** Configuração padrão de viewport para whileInView. */
export const inViewport = { once: true, amount: 0.15 } as const
