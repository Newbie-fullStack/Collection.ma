import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { formatMAD, cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Package, MessageSquare, DollarSign,
  AlertTriangle, FileText, Settings, BarChart3
} from 'lucide-react';
import api from '@/api/client';
import {
  AdminUsersPage, AdminListingsPage, AdminCategoriesPage,
  AdminAdvertisementsPage, AdminCommissionsPage, AdminDisputesPage,
  AdminInvoicesPage, AdminMessagesPage
} from './AdminSubPages';

interface DashboardStats {
  utilisateurs: number;
  vendeurs: number;
  annonces_actives: number;
  annonces_vendues: number;
  commandes_en_cours: number;
  litiges_ouverts: number;
  ca_total: number;
  en_attente_virement: number;
}

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const { section } = useParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error);
  }, []);

  // Keep the active section in sync with the URL (:section param) for deep links.
  useEffect(() => {
    if (section) setActiveSection(section);
  }, [section]);

  const goToSection = (key: string) => {
    setActiveSection(key);
    if (key === 'dashboard') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', `/admin/${key}`);
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard },
    { key: 'users', icon: Users },
    { key: 'listings', icon: Package },
    { key: 'messages', icon: MessageSquare },
    { key: 'categories', icon: Settings },
    { key: 'advertisements', icon: BarChart3 },
    { key: 'commissions', icon: DollarSign },
    { key: 'disputes', icon: AlertTriangle },
    { key: 'invoices', icon: FileText },
  ];

  const menuLabels: Record<string, string> = {
    dashboard: isAr ? 'لوحة التحكم' : 'Dashboard',
    users: isAr ? 'المستخدمون' : 'Utilisateurs',
    listings: isAr ? 'الإعلانات' : 'Annonces',
    messages: isAr ? 'الرسائل' : 'Messages',
    categories: isAr ? 'الفئات' : 'Categories',
    advertisements: isAr ? 'الإعلانات المدفوعة' : 'Publicites',
    commissions: isAr ? 'العمولات' : 'Commissions',
    disputes: isAr ? 'النزاعات' : 'Litiges',
    invoices: isAr ? 'الفواتير' : 'Factures',
  };

  const statCards = stats ? [
    { label: isAr ? 'المستخدمون' : 'Utilisateurs', value: stats.utilisateurs, icon: Users, color: 'text-gold' },
    { label: isAr ? 'البائعون' : 'Vendeurs', value: stats.vendeurs, icon: Users, color: 'text-green' },
    { label: isAr ? 'إعلانات نشطة' : 'Annonces actives', value: stats.annonces_actives, icon: Package, color: 'text-blue' },
    { label: isAr ? 'مبيعات' : 'Vendues', value: stats.annonces_vendues, icon: Package, color: 'text-gold' },
    { label: isAr ? 'طلبات جارية' : 'En cours', value: stats.commandes_en_cours, icon: Package, color: 'text-yellow' },
    { label: isAr ? 'نزاعات مفتوحة' : 'Litiges', value: stats.litiges_ouverts, icon: AlertTriangle, color: 'text-red' },
    { label: isAr ? 'إجمالي العمولات' : 'CA Commissions', value: formatMAD(stats.ca_total, i18n.language), icon: DollarSign, color: 'text-green' },
    { label: isAr ? 'في انتظار السحب' : 'En attente', value: formatMAD(stats.en_attente_virement, i18n.language), icon: DollarSign, color: 'text-gold' },
  ] : [];

  const renderContent = () => {
    if (activeSection === 'dashboard') {
      if (!stats) {
        return (
          <>
            <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
              {isAr ? 'لوحة تحكم المدير' : 'Dashboard Admin'}
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-navy-hover" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-navy-hover rounded w-1/2" />
                      <div className="h-5 bg-navy-hover rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      }
      return (
        <>
          <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
            {isAr ? 'لوحة تحكم المدير' : 'Dashboard Admin'}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-text-subdued">{stat.label}</p>
                      <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-cream mb-4">
              {isAr ? 'نشاط حديث' : 'Activite recente'}
            </h2>
            <p className="text-text-subdued text-sm">
              {isAr ? 'سيتم عرض النشاط الأخير هنا' : 'Les dernieres activites apparaitront ici'}
            </p>
          </div>
        </>
      );
    }

    const pages: Record<string, React.ReactNode> = {
      users: <AdminUsersPage />,
      listings: <AdminListingsPage />,
      categories: <AdminCategoriesPage />,
      advertisements: <AdminAdvertisementsPage />,
      commissions: <AdminCommissionsPage />,
      disputes: <AdminDisputesPage />,
      invoices: <AdminInvoicesPage />,
      messages: <AdminMessagesPage />,
    };

    return pages[activeSection] || null;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
      <div className={cn('flex flex-col md:flex-row gap-6', isAr && 'md:flex-row-reverse')}>
        {/* Mobile tab navigation (visible below md) */}
        <nav className="md:hidden -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 mb-4 overflow-x-auto whitespace-nowrap border-b border-gold/10 scrollbar-thin flex gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => goToSection(item.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
                  activeSection === item.key
                    ? 'bg-gold/20 text-gold'
                    : 'text-text-subdued hover:bg-navy-hover hover:text-cream'
                )}
              >
                <Icon className="w-4 h-4" />
                {menuLabels[item.key]}
              </button>
            );
          })}
        </nav>
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-navy-card border border-gold/15 rounded-lg p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="text-center mb-4 pb-4 border-b border-gold/20">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-gold">A</span>
              </div>
              <p className="text-cream font-medium">{user?.pseudo}</p>
              <p className="text-text-subdued text-xs">{isAr ? 'مدير' : 'Admin'}</p>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => goToSection(item.key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-left',
                      activeSection === item.key
                        ? 'bg-gold/20 text-gold'
                        : 'text-text-subdued hover:bg-navy-hover hover:text-cream',
                      isAr && 'flex-row-reverse text-right'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {menuLabels[item.key]}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
