import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f1117] text-white mt-14 sm:mt-20">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-red-400 to-primary" />

      <div className="container mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-4">
              <div className="text-white font-extrabold text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                STEAV
              </div>
              <div className="text-primary font-bold text-xs tracking-[0.2em] uppercase">NEWS</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              ប្រភពព័ត៌មានដែលអ្នកអាចទុកចិត្តបាន ពី កម្ពុជា និងពិភពលោក។
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/steavnews" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#1877f2] border border-white/10 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-black border border-white/10 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] border border-white/10 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary block rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'ទំព័រដើម' },
                { href: '/?category=កម្សាន្ត', label: 'កម្សាន្ត' },
                { href: '/?category=សង្គម', label: 'សង្គម' },
                { href: '/?category=កីឡា', label: 'កីឡា' },
                { href: '/?category=ពិភពលោក', label: 'ពិភពលោក' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary block rounded-full" />
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact-us" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Contact Form
                </Link>
              </li>
              <li className="text-gray-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                info@steavnews.com
              </li>
              <li className="text-gray-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +855 96 392 5127
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary block rounded-full" />
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-xs sm:text-sm">
          <p>© {currentYear} <span className="text-gray-300 font-semibold">STEAV NEWS</span>. All rights reserved.</p>
          <p className="text-gray-600 flex items-center justify-center gap-1.5">
            Made with 
            <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            in Cambodia
          </p>
        </div>
      </div>
    </footer>
  );
}
