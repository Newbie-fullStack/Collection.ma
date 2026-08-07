import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, User, Bell, ShoppingBag, ChevronDown, Search, Home, Tag, SlidersHorizontal, Crown, LayoutGrid, Hammer, Sparkles, PenLine, Info, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { notificationsApi, conversationsApi } from '@/api';
import { cn } from '@/lib/utils';

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCounts = () => {
      notificationsApi.unreadCount().then(({ data }) => setNotifCount(data.count)).catch(() => {});
      conversationsApi.unreadCount().then(({ data }) => setMsgCount(data.count)).catch(() => {});
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { key: 'accueil', path: '/', icon: Home },
    { key: 'categories', path: '/categories', icon: LayoutGrid },
    { key: 'encheres', path: '/listings?mode=enchere', icon: Hammer },
    { key: 'nouveautes', path: '/listings?sort_by=created_at&sort_dir=desc', icon: Sparkles },
    { key: 'blog', path: '/blog', icon: PenLine },
    { key: 'aide', path: '/aide', icon: Info },
  ];

  const sellPath = isAuthenticated && (user?.role === 'vendeur' || user?.role === 'both') ? '/vendeur/ajouter' : '/devenir-vendeur';

  return (
    <header className="relative z-50 bg-navy border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 pt-3 space-y-2">

        {/* Row 1: Logo + Search + Actions */}
        <div className={cn(
          'flex items-center flex-nowrap gap-2 sm:gap-4 h-14 px-3 sm:px-5 rounded-2xl',
          'bg-navy-card/80 border border-gold/15',
          isAr && 'md:flex-row-reverse'
        )}>
          {/* Logo icon (mobile) */}
          <Link to="/" className="shrink-0 sm:hidden relative z-10">
            <img src="/logo.png" alt="collection.ma" className="w-9 h-9 object-contain" />
          </Link>

          {/* Centered brand text (mobile only, hidden when menu open) */}
          <div className={cn('sm:hidden absolute inset-0 flex items-center justify-center pointer-events-none', mobileMenuOpen && 'invisible')}>
            <span className="font-serif font-bold text-2xl text-white">collection.ma</span>
          </div>

          {/* Full logo (desktop only) */}
          <Link to="/" className="hidden sm:block shrink-0">
            <Logo variant="light" size="md" />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-2">
            <div className={cn('flex w-full', isAr && 'flex-row-reverse')}>
              <div className={cn('relative flex-1', isAr ? 'rounded-r-xl' : 'rounded-l-xl')}>
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-subdued', isAr ? 'right-4' : 'left-4')} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث عن...' : 'Rechercher une collection rare...'}
                  className={cn(
                    'w-full py-2.5 bg-navy border border-gold/15 text-cream placeholder-text-subdued text-sm focus:outline-none focus:border-gold/40 transition-colors',
                    isAr ? 'pl-4 pr-11 rounded-l-none border-r-0' : 'pr-4 pl-11 rounded-r-none border-l-0'
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('/recherche')}
                className={cn(
                  'px-3 bg-navy border border-gold/15 border-l-0 text-text-subdued hover:text-gold hover:bg-navy-card transition-colors',
                  isAr ? 'rounded-l-xl border-r-0 border-l' : 'rounded-r-xl'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gold/15" />

          {/* Actions */}
          <div className={cn('hidden md:flex items-center gap-1', isAr && 'flex-row-reverse')}>
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-text-subdued hover:text-gold text-sm transition-colors rounded-xl hover:bg-navy-card"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">{isAr ? 'AR' : 'FR'}</span>
                <ChevronDown className={cn('w-3 h-3 opacity-40 transition-transform', langOpen && 'rotate-180')} />
              </button>

              {langOpen && (
                <div className={cn(
                  'absolute top-full mt-1 w-36 bg-navy-card border border-gold/15 rounded-xl shadow-2xl py-1 z-50',
                  isAr ? 'right-0' : 'left-0'
                )}>
                  <button
                    onClick={() => { i18n.changeLanguage('fr'); setLangOpen(false); }}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                      !isAr ? 'text-gold bg-gold/10' : 'text-text-subdued hover:text-gold hover:bg-navy-hover'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Francais
                    {!isAr && <span className="ml-auto text-gold text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => { i18n.changeLanguage('ar'); setLangOpen(false); }}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                      isAr ? 'text-gold bg-gold/10' : 'text-text-subdued hover:text-gold hover:bg-navy-hover'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    العربية
                    {isAr && <span className="ml-auto text-gold text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gold/15" />

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2.5 text-text-subdued hover:text-gold transition-colors rounded-xl hover:bg-navy-card"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {count > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center px-1">
                      {count}
                    </span>
                  )}
                </button>

                <Link to="/notifications" className="relative p-2.5 text-text-subdued hover:text-gold transition-colors rounded-xl hover:bg-navy-card">
                  <Bell className="w-4.5 h-4.5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center px-1">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </Link>

                <Link to="/messages" className="relative p-2.5 text-text-subdued hover:text-gold transition-colors rounded-xl hover:bg-navy-card">
                  <MessageSquare className="w-4.5 h-4.5" />
                  {msgCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center px-1">
                      {msgCount > 99 ? '99+' : msgCount}
                    </span>
                  )}
                </Link>

                <div className="w-px h-5 bg-gold/15" />

                {/* User dropdown */}
                <div className="relative group">
                  <button className={cn('flex items-center gap-2 px-3 py-2 text-text-subdued hover:text-gold transition-colors rounded-xl hover:bg-navy-card', isAr && 'flex-row-reverse')}>
                    <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-gold">{user?.pseudo?.[0]?.toUpperCase()}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 opacity-40" />
                  </button>

                  <div className={cn(
                    'absolute top-full mt-2 w-56 bg-navy-card border border-gold/15 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50',
                    isAr ? 'right-0' : 'left-0'
                  )}>
                    <div className="px-4 py-2.5 border-b border-gold/10">
                      <p className="text-sm font-medium text-cream">{user?.pseudo}</p>
                      <p className="text-xs text-text-subdued">{user?.email}</p>
                    </div>
                    <Link to="/acheteur" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover transition-colors">
                      {isAr ? 'حسابي' : 'Mon compte'}
                    </Link>
                    {(user?.role === 'vendeur' || user?.role === 'both') && (
                      <Link to="/vendeur" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover transition-colors">
                        {t('nav.espace_vendeur')}
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover transition-colors">
                        Administration
                      </Link>
                    )}
                    <hr className="my-1 border-gold/10" />
                    <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-light hover:bg-red/5 transition-colors">
                      {t('nav.deconnexion')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="flex items-center gap-2 px-3 py-2 text-sm text-text-subdued hover:text-cream transition-colors rounded-xl hover:bg-navy-card">
                  <User className="w-4 h-4" />
                  {t('nav.connexion')}
                </Link>

                <Link to="/auth/register" className="flex items-center gap-2 px-3 py-2 text-sm text-text-subdued hover:text-cream transition-colors rounded-xl hover:bg-navy-card">
                  <Crown className="w-4 h-4" />
                  {t('nav.inscription')}
                </Link>

                <div className="w-px h-5 bg-gold/15" />

                <Link to={sellPath} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-navy bg-gold hover:bg-gold-light transition-colors rounded-xl shadow-sm">
                  <Tag className="w-4 h-4" />
                  {isAr ? 'إضافة منتج' : '+ Vendre'}
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-text-subdued">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Row 2: Nav links */}
        <nav className={cn(
          'hidden md:block rounded-2xl',
          'bg-navy-card/80 border border-gold/15',
        )}>
          <ul className={cn('flex items-center justify-center', isAr && 'flex-row-reverse')}>
            {navItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.key} className="flex items-center">
                  <Link
                    to={item.path}
                    className={cn(
                      'relative flex items-center gap-2 px-5 py-3 text-sm text-text-subdued hover:text-gold transition-colors',
                      'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-gold after:rounded-full after:transition-all after:duration-300',
                      'hover:after:w-8'
                    )}
                  >
                    <Icon className="w-4 h-4 opacity-60" />
                    <span>{t(`nav.${item.key}`)}</span>
                  </Link>
                  {i < navItems.length - 1 && (
                    <div className="w-px h-4 bg-gold/15" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 p-4 rounded-2xl bg-navy-card border border-gold/15 shadow-2xl space-y-1">
          <form onSubmit={handleSearch} className="pb-3">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث...' : 'Rechercher...'}
                className={cn(
                  'flex-1 py-2.5 px-4 bg-navy border border-gold/15 text-cream placeholder-text-subdued text-sm focus:outline-none',
                  isAr ? 'rounded-r-xl border-l-0' : 'rounded-l-xl border-r-0'
                )}
              />
              <button
                type="button"
                onClick={() => { navigate('/recherche'); setMobileMenuOpen(false); }}
                className={cn(
                  'px-4 bg-navy border border-gold/15 text-text-subdued hover:text-gold transition-colors',
                  isAr ? 'rounded-l-xl border-r-0' : 'rounded-r-xl border-l-0'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </form>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.key} to={item.path} className="flex items-center gap-3 px-4 py-2.5 text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Icon className="w-4 h-4 opacity-60" />
                <span className="text-sm">{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}

          <Link to={sellPath} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gold hover:bg-gold/10 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
            <Tag className="w-4 h-4" />
            + {isAr ? 'إضافة منتج' : 'Vendre'}
          </Link>

          <hr className="border-gold/10 my-2" />

          <div className="flex items-center gap-2 px-4 py-2">
            <Globe className="w-4 h-4 text-text-subdued" />
            <button onClick={() => { i18n.changeLanguage('fr'); setMobileMenuOpen(false); }} className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors', !isAr ? 'bg-gold text-navy font-semibold' : 'text-text-subdued hover:text-cream')}>
              FR
            </button>
            <button onClick={() => { i18n.changeLanguage('ar'); setMobileMenuOpen(false); }} className={cn('px-3 py-1.5 text-sm rounded-lg transition-colors', isAr ? 'bg-gold text-navy font-semibold' : 'text-text-subdued hover:text-cream')}>
              AR
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-gold">{user?.pseudo?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream">{user?.pseudo}</p>
                  <p className="text-xs text-text-subdued truncate">{user?.email}</p>
                </div>
              </div>
              <Link to="/acheteur" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <User className="w-4 h-4" />
                {isAr ? 'حسابي' : 'Mon compte'}
              </Link>
              <Link to="/messages" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare className="w-4 h-4" />
                {isAr ? 'الرسائل' : 'Messages'}
                {msgCount > 0 && <span className="ml-auto bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">{msgCount}</span>}
              </Link>
              <Link to="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Bell className="w-4 h-4" />
                {isAr ? 'الإشعارات' : 'Notifications'}
                {notifCount > 0 && <span className="ml-auto bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">{notifCount}</span>}
              </Link>
              <button onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {isAr ? 'سلة المشتريات' : 'Panier'}
                {count > 0 && <span className="ml-auto bg-gold text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>}
              </button>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-light hover:bg-red/5 rounded-xl transition-colors">
                {t('nav.deconnexion')}
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-subdued hover:text-gold hover:bg-navy-hover rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <User className="w-4 h-4" />
                {t('nav.connexion')}
              </Link>
              <Link to="/auth/register" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold font-medium hover:bg-gold/10 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Crown className="w-4 h-4" />
                {t('nav.inscription')}
              </Link>
            </>
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
