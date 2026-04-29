import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import {
  easeLuxe,
  fadeIn,
  scaleIn,
  staggerContainer,
  staggerItem
} from "@/lib/motion";

export function NotFoundPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#020617] px-6 py-16 text-white">
      {/* Glow decorativo de fundo — gradiente radial violeta sutil. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 35%, rgba(124,58,237,0.18), rgba(2,6,23,0) 70%)"
        }}
      />
      {/* Linha tracejada decorativa atrás do 404 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent, rgba(167,139,250,0.5) 50%, transparent)"
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
      >
        {/* Eyebrow */}
        <motion.span
          variants={staggerItem}
          className="text-xs font-semibold uppercase tracking-[3.6px] text-[#a78bfa]"
        >
          NOIR LUXE — Erro 404
        </motion.span>

        {/* 404 gigante com glow */}
        <motion.h1
          variants={scaleIn}
          className="relative mt-6 select-none font-black tracking-[-0.06em] leading-none text-transparent text-[clamp(8rem,22vw,18rem)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #f8fafc 0%, #94a3b8 60%, rgba(148,163,184,0) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0 12px 32px rgba(124,58,237,0.25))"
          }}
        >
          404
          {/* Brilho violeta atrás do número, animado pra "respirar" */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 4, repeat: Infinity, ease: easeLuxe }}
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(124,58,237,0.6), rgba(124,58,237,0) 70%)"
            }}
          />
        </motion.h1>

        <motion.h2
          variants={staggerItem}
          className="mt-2 text-2xl font-light uppercase tracking-[6px] text-white sm:text-3xl"
        >
          Página não encontrada
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className="mt-4 max-w-md text-sm leading-relaxed text-[#94a3b8] sm:text-base"
        >
          O endereço que você acessou não faz parte do nosso atelier. Pode ter
          sido movido, removido — ou nunca existiu na coleção.
        </motion.p>

        {/* Ações */}
        <motion.div
          variants={staggerItem}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Link
            to="/products"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-6 text-sm font-medium tracking-[0.28px] text-white transition-all hover:bg-[#6d28d9] active:scale-[0.99]"
            style={{
              boxShadow:
                "0px 10px 15px -3px rgba(124,58,237,0.25), 0px 4px 6px -4px rgba(124,58,237,0.25)"
            }}
          >
            <Compass className="h-4 w-4" />
            Explorar a Loja
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer compacto */}
      <motion.footer
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 left-0 right-0 z-10 text-center text-xs uppercase tracking-[2.4px] text-[#475569]"
      >
        NOIR LUXE · E-commerce premium.
      </motion.footer>
    </div>
  );
}
