import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f1117] text-white mt-14 sm:mt-20">
      {/* Top accent bar */}
      <div className="h-1 bg-primary" />

      <div className="container mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-5 flex items-center">
              <Image 
                src="/uploads/images/LOGO.jpg" 
                alt="Steav News Logo" 
                width={120} 
                height={40} 
                className="object-contain" 
                unoptimized 
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-semibold" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
              ព័ត៌មានដែលអានហើយញ៉ាក់សាច់
            </p>
            {/* Social Icons */}
            <div className="flex gap-2">
              <a href="https://www.facebook.com/steavnews" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-10 h-10 bg-gray-800 hover:bg-[#1877f2] flex items-center justify-center transition-colors rounded-none">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                className="w-10 h-10 bg-gray-800 hover:bg-black flex items-center justify-center transition-colors rounded-none">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-10 h-10 bg-gray-800 hover:bg-[#e6683c] flex items-center justify-center transition-colors rounded-none">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase mb-4" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
              តំណភ្ជាប់រហ័ស
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'ទំព័រដើម' },
                { href: '/category/entertainment', label: 'កម្សាន្ត' },
                { href: '/category/society', label: 'សង្គម' },
                { href: '/category/love', label: 'ស្នេហា' },
                { href: '/category/world', label: 'ពិភពលោក' },
                { href: '/newspaper', label: 'ធ្វើកាសែត' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors block border-l-2 border-transparent hover:border-primary pl-2 -ml-2" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase mb-4" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
              ទំនាក់ទំនង
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact-us" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                  ទម្រង់ទំនាក់ទំនង
                </Link>
              </li>
              <li className="text-gray-400 text-sm flex items-center gap-2">
                info@steavnews.com
              </li>
              <li className="text-gray-400 text-sm flex items-center gap-2">
                +855 96 392 5127
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase mb-4" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
              លក្ខខណ្ឌច្បាប់
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors block border-l-2 border-transparent hover:border-primary pl-2 -ml-2" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                  គោលការណ៍ឯកជនភាព
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors block border-l-2 border-transparent hover:border-primary pl-2 -ml-2" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                  លក្ខខណ្ឌប្រើប្រាស់
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-xs sm:text-sm">
          <p>© {currentYear} <span className="text-gray-300 font-semibold">STEAV NEWS</span>. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        </div>
      </div>
    </footer>
  );
}
