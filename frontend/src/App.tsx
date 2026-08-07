import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { ListingsPage } from '@/pages/ListingsPage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { SellerDashboard } from '@/pages/seller/SellerDashboard';
import { SellerListingsPage } from '@/pages/seller/SellerListingsPage';
import { AddListingPage } from '@/pages/seller/AddListingPage';
import { BuyerDashboard } from '@/pages/buyer/BuyerDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { HelpPage } from '@/pages/public/HelpPage';
import { CGUPage } from '@/pages/public/CGUPage';
import { AdvancedSearchPage } from '@/pages/public/AdvancedSearchPage';
import { BlogPage } from '@/pages/public/BlogPage';
import { BlogDetailPage } from '@/pages/public/BlogDetailPage';
import { BecomeSellerPage } from '@/pages/public/BecomeSellerPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { WalletPage } from '@/pages/wallet/WalletPage';
import { WalletTopupPage } from '@/pages/wallet/WalletTopupPage';
import { WithdrawalPage } from '@/pages/wallet/WithdrawalPage';
import { MessagingPage } from '@/pages/MessagingPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/listings/:numero_auto" element={<ListingDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/recherche" element={<AdvancedSearchPage />} />

                {/* Info */}
                <Route path="/a-propos" element={<AboutPage />} />
                <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
                <Route path="/aide" element={<HelpPage />} />
                <Route path="/cgu" element={<CGUPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />

                {/* Auth */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                {/* Become seller */}
                <Route path="/devenir-vendeur" element={<BecomeSellerPage />} />

                {/* Checkout */}
                <Route path="/checkout" element={
                  <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                } />

                {/* Wallet */}
                <Route path="/portefeuille" element={
                  <ProtectedRoute><WalletPage /></ProtectedRoute>
                } />
                <Route path="/portefeuille/recharger" element={
                  <ProtectedRoute><WalletTopupPage /></ProtectedRoute>
                } />
                <Route path="/portefeuille/retrait" element={
                  <ProtectedRoute><WithdrawalPage /></ProtectedRoute>
                } />

                {/* Messaging */}
                <Route path="/messages" element={
                  <ProtectedRoute><MessagingPage /></ProtectedRoute>
                } />
                <Route path="/messages/:conversationId" element={
                  <ProtectedRoute><MessagingPage /></ProtectedRoute>
                } />

                {/* Account */}
                <Route path="/notifications" element={
                  <ProtectedRoute><NotificationsPage /></ProtectedRoute>
                } />
                <Route path="/compte" element={
                  <ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>
                } />

                {/* Buyer */}
                <Route path="/acheteur" element={
                  <ProtectedRoute><BuyerDashboard /></ProtectedRoute>
                } />
                <Route path="/acheteur/:section" element={
                  <ProtectedRoute><BuyerDashboard /></ProtectedRoute>
                } />

                {/* Seller - requires seller role */}
                <Route path="/vendeur" element={
                  <ProtectedRoute requireSeller><SellerDashboard /></ProtectedRoute>
                } />
                <Route path="/vendeur/:section" element={
                  <ProtectedRoute requireSeller><SellerDashboard /></ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/:section" element={
                  <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
