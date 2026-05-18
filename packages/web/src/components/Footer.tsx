import Link from "next/link";
import { Shield } from "lucide-react";

const links = {
  Product:   ["Live Demo", "API", "Browser Extension", "Pricing", "Changelog"],
  Developers:["Documentation", "API Reference", "SDKs", "Webhooks", "Status"],
  Company:   ["About", "Blog", "Careers", "Press", "Contact"],
  Legal:     ["Privacy Policy", "Terms of Service", "GDPR", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/6 py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-semibold text-gray-12">KAIROS</span>
            </Link>
            <p className="text-sm text-gray-10 leading-relaxed max-w-[200px]">
              Fraud detection infrastructure for the modern web.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-9">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-10 uppercase tracking-[0.08em] mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-gray-10 hover:text-gray-12 transition-colors duration-150"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-9">
            © {new Date().getFullYear()} KAIROS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-9">GDPR • SOC 2 Type II • ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
