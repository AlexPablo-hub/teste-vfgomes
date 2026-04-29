export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs sm:flex-row sm:px-6 lg:px-8">
        <p className="text-[var(--color-muted-foreground)]">
          © {new Date().getFullYear()} NOIR LUXE. Todos os direitos reservados.
        </p>
        <ul className="flex items-center gap-x-5 text-[10px] tracking-wider text-[var(--color-muted-foreground)]">
          <li><a href="#" className="hover:text-[var(--color-foreground)]">POLÍTICA DE PRIVACIDADE</a></li>
          <li><a href="#" className="hover:text-[var(--color-foreground)]">TERMOS DE SERVIÇO</a></li>
          <li><a href="#" className="hover:text-[var(--color-foreground)]">ENVIO</a></li>
          <li><a href="#" className="hover:text-[var(--color-foreground)]">DEVOLUÇÕES</a></li>
        </ul>
      </div>
    </footer>
  )
}
