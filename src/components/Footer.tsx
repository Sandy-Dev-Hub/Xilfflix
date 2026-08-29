import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/8 bg-xf-bg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" aria-label="Xilfflix Home">
            <span className="font-display font-black text-xl tracking-tighter">
              <span className="text-xf-red">X</span>
              <span className="text-white">ILFFLIX</span>
            </span>
          </Link>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link to="/legal" className="text-xf-subtle text-sm hover:text-white transition-colors">
              Legal & Privacy
            </Link>
            <p className="text-xf-subtle text-sm hidden sm:block">•</p>
            <p className="text-xf-subtle text-sm">
              © 2026 Xilfflix. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
