import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090B] px-5 py-12 text-xs text-[#737C88] sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center bg-[#78AFFF] font-semibold text-[#08090B]">
              V
            </span>
            <span className="font-medium text-[#F4F5F7]">VoxDesk</span>
          </div>
          <p className="mt-4 max-w-sm leading-5">
            AI customer operations infrastructure for conversations, CRM actions, and supervised
            business workflows.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A8B3]">
            Product
          </p>
          <nav className="mt-4 grid gap-2">
            <Link href="/demo" className="hover:text-[#F4F5F7]">
              Live conversation demo
            </Link>
            <Link href="/dashboard/conversations" className="hover:text-[#F4F5F7]">
              Operations workspace
            </Link>
            <Link href="/#solutions" className="hover:text-[#F4F5F7]">
              Inbound and outbound
            </Link>
          </nav>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#A1A8B3]">System</p>
          <nav className="mt-4 grid gap-2">
            <Link href="/privacy" className="hover:text-[#F4F5F7]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#F4F5F7]">
              Terms
            </Link>
            <a
              href="https://github.com/arslanvuzmal/voxdesk-ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#F4F5F7]"
            >
              Source repository
            </a>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/[0.08] pt-5 font-mono text-[10px] sm:flex-row sm:justify-between">
        <p>© 2026 VoxDesk. Interactive demonstration platform.</p>
        <p>Designed and built by Arslan Vuzmal Lone</p>
      </div>
    </footer>
  );
}
