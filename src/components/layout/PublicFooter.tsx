import { Link } from 'react-router-dom'

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-white text-lg">rekruit</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              La plateforme de recrutement intelligente pour les TPE, PME et agences de recrutement.
            </p>
            <p className="text-xs">© {year} rekruit. Tous droits réservés.</p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Aide</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">CGU</Link></li>
              <li><Link to="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
              <li><Link to="/legal-notice" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Remboursements</Link></li>
              <li><Link to="/cookie-settings" className="hover:text-white transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>Fait avec ❤️ en France</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link to="/cookie-settings" className="hover:text-white transition-colors">Gérer les cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
