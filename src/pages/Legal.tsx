import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LEGAL_SECTIONS = [
  { 
    id: 'About', 
    label: 'About', 
    content: 'Xilfflix is a premier streaming platform dedicated to bringing you the best in movies, TV shows, and original content. Our mission is to provide endless entertainment tailored to your preferences, offering a seamless and immersive viewing experience. Founded in 2026, we strive to push the boundaries of digital entertainment.' 
  },
  { 
    id: 'Privacy', 
    label: 'Privacy', 
    content: 'We take your privacy seriously. This policy outlines how we collect, use, and protect your personal data. We are committed to maintaining the trust and confidence of our users by ensuring your information is secure. Your data is used exclusively to personalize your experience and improve our services. We do not sell your personal information to third parties.' 
  },
  { 
    id: 'Terms', 
    label: 'Terms', 
    content: 'These Terms of Service govern your use of Xilfflix. By accessing or using our platform, you agree to be bound by these terms. We reserve the right to modify these terms at any time. Users must be at least 13 years of age to use our services. Any violation of these terms may result in account termination.' 
  },
];

export default function Legal() {
  const [activeSection, setActiveSection] = useState(LEGAL_SECTIONS[0].id);

  const activeContent = LEGAL_SECTIONS.find(s => s.id === activeSection)?.content;

  return (
    <div className="min-h-screen bg-xf-bg pt-24 pb-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto bg-xf-card rounded-2xl border border-white/10 p-8 sm:p-12">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold text-white">Legal Information</h1>
          <Link to="/" className="flex items-center gap-2 text-xf-subtle hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-12 sm:grid-cols-[1fr_2fr]">
          {/* Links Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Quick Links</h2>
            <ul className="space-y-4">
              {LEGAL_SECTIONS.map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveSection(id)}
                    className={`transition-colors flex items-center gap-2 text-left ${
                      activeSection === id ? 'text-white font-medium' : 'text-xf-subtle hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Content Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">{activeSection}</h2>
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <p className="text-xf-subtle text-sm leading-relaxed whitespace-pre-wrap">
                {activeContent}
              </p>
            </div>
          </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
           <p className="text-xf-subtle text-sm leading-relaxed">
             The information provided on this platform is for demonstration purposes. Please review our Terms of Service and Privacy Policy for detailed information regarding user rights and obligations.
           </p>
        </div>
      </div>
    </div>
  );
}

