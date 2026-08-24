import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Help', href: '#' },
  { label: 'Careers', href: '#' },
];

const SOCIAL_LINKS = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/8 bg-xf-bg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
        {/* Logo + Socials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <Link to="/" aria-label="Xilfflix Home">
            <span className="font-display font-black text-2xl tracking-tighter">
              <span className="text-xf-red">X</span>
              <span className="text-white">ILFFLIX</span>
            </span>
          </Link>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full bg-xf-card border border-white/10 flex items-center justify-center text-xf-muted hover:text-white hover:border-white/30 transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xf-subtle text-sm hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-6 border-t border-white/8">
          <p className="text-xf-subtle text-xs">
            © 2026 Xilfflix. All rights reserved. For demo purposes only.
          </p>
          <p className="text-xf-subtle text-xs">
            Built with React + Vite + TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
