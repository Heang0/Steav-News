import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="mainFooter" className="site-footer bg-gray-800 text-white py-8 sm:py-10 mt-12">
      <div className="container mx-auto px-4">
        <div className="footer-content flex flex-col items-center">
          <div className="footer-logo text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-5 text-center w-full">
            STEAV<br />NEWS
          </div>

          <div className="footer-sections-wrapper flex flex-wrap justify-center gap-6 sm:gap-8 w-full max-w-4xl">
            <div className="footer-links text-center flex-grow min-w-[140px]">
              <h3 className="text-primary text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
              <ul className="list-none space-y-1.5 sm:space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    ទំព័រដើម
                  </Link>
                </li>
                <li>
                  <Link href="/?category=កម្សាន្ត" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    កម្សាន្ត
                  </Link>
                </li>
                <li>
                  <Link href="/?category=សង្គម" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    សង្គម
                  </Link>
                </li>
                <li>
                  <Link href="/?category=កីឡា" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    កីឡា
                  </Link>
                </li>
                <li>
                  <Link href="/?category=ពិភពលោក" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    ពិភពលោក
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-contact text-center flex-grow min-w-[140px]">
              <h3 className="text-primary text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="list-none space-y-1.5 sm:space-y-2">
                <li>
                  <Link href="/contact-us" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    Contact Form
                  </Link>
                </li>
                <li className="text-xs sm:text-base text-gray-300">
                  info@steavnews.com
                </li>
                <li className="text-xs sm:text-base text-gray-300">
                  +855 96 392 5127
                </li>
              </ul>
            </div>

            <div className="footer-policy text-center flex-grow min-w-[140px]">
              <h3 className="text-primary text-base sm:text-lg mb-3 sm:mb-4">Privacy Policy</h3>
              <ul className="list-none space-y-1.5 sm:space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    Read Our Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 font-bold text-sm sm:text-lg hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-social text-center flex-grow min-w-[140px]">
              <h3 className="text-primary text-base sm:text-lg mb-3 sm:mb-4">Follow Us</h3>
              <div className="social-icons flex justify-center gap-3 sm:gap-4">
                <a
                  href="https://www.facebook.com/steavnews"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-300 text-2xl sm:text-3xl hover:text-primary transition-transform hover:-translate-y-1"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-300 text-2xl sm:text-3xl hover:text-primary transition-transform hover:-translate-y-1"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-300 text-2xl sm:text-3xl hover:text-primary transition-transform hover:-translate-y-1"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom border-t border-gray-600 pt-4 sm:pt-5 mt-4 sm:mt-5 text-center text-gray-400 text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} STEAV NEWS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
