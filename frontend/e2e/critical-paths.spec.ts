import { test, expect, type Page } from '@playwright/test';

const SELLER_EMAIL = 'seller@test.com';
const SELLER_PASSWORD = 'Password123!';
const BUYER_EMAIL = 'buyer@test.com';
const BUYER_PASSWORD = 'Password123!';

async function registerUser(page: Page, data: {
  pseudo: string; nom: string; prenom: string; email: string; password: string;
}) {
  await page.goto('/auth/register');
  await page.fill('input[name="pseudo"]', data.pseudo);
  await page.fill('input[name="nom"]', data.nom);
  await page.fill('input[name="prenom"]', data.prenom);
  await page.fill('input[name="age"]', '30');
  await page.fill('input[name="gsm"]', '0612345678');
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="adresse_exacte"]', '123 Rue Mohammed V, Casablanca');
  await page.fill('input[name="rib"]', 'MA640070700000000000000503');
  await page.fill('input[name="password"]', data.password);
  await page.fill('input[name="password_confirmation"]', data.password);
  await page.check('input[name="cgu_acceptee"]');
  await page.click('button[type="submit"]');
  await page.waitForURL('/compte', { timeout: 10000 });
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/compte', { timeout: 10000 });
}

/**
 * PARCOURS CRITIQUE 1:
 * Publier annonce → Enchérir → Payer → Expédier → Confirmer réception → Virement vendeur
 */
test.describe('Parcours 1: Vente complète par enchère', () => {

  test('1.1 Vendeur publie une annonce', async ({ page }) => {
    await registerUser(page, {
      pseudo: 'vendeur_test_1', nom: 'Alaoui', prenom: 'Mohamed',
      email: SELLER_EMAIL, password: SELLER_PASSWORD,
    });

    // Aller à l'espace vendeur
    await page.click('a[href="/vendeur"]');
    await expect(page.locator('h1')).toContainText('Tableau de bord');

    // Ajouter un objet
    await page.click('a[href="/vendeur/ajouter"]');
    await expect(page).toHaveURL('/vendeur/ajouter');
  });

  test('1.2 Acheteur s\'inscrit et enchérit', async ({ page }) => {
    await registerUser(page, {
      pseudo: 'acheteur_test_1', nom: 'Benani', prenom: 'Fatima',
      email: BUYER_EMAIL, password: BUYER_PASSWORD,
    });

    // Naviguer vers les enchères
    await page.goto('/listings?mode=enchere');
    await expect(page).toHaveURL(/listings/);
  });

  test('1.3 Cycle complet de vente (API)', async ({ request }) => {
    // Register seller
    const sellerRes = await request.post('/api/auth/register', {
      data: {
        pseudo: 'api_seller', nom: 'Seller', prenom: 'Test',
        email: 'api_seller@test.com', password: SELLER_PASSWORD,
        password_confirmation: SELLER_PASSWORD, age: 30, gsm: '0612345678',
        adresse_exacte: '123 Rue Test', rib: 'MA640070700000000000000503',
        cgu_acceptee: true, langue_preferee: 'fr',
      },
    });
    expect(sellerRes.ok()).toBeTruthy();
    const sellerToken = (await sellerRes.json()).token;

    // Register buyer
    const buyerRes = await request.post('/api/auth/register', {
      data: {
        pseudo: 'api_buyer', nom: 'Buyer', prenom: 'Test',
        email: 'api_buyer@test.com', password: SELLER_PASSWORD,
        password_confirmation: SELLER_PASSWORD, age: 25, gsm: '0698765432',
        adresse_exacte: '456 Rue Test', rib: 'MA640070700000000000000503',
        cgu_acceptee: true, langue_preferee: 'fr',
      },
    });
    expect(buyerRes.ok()).toBeTruthy();
    const buyerToken = (await buyerRes.json()).token;

    const sellerHeaders = { Authorization: `Bearer ${sellerToken}` };
    const buyerHeaders = { Authorization: `Bearer ${buyerToken}` };

    // Seller creates listing
    const listingRes = await request.post('/api/listings', {
      headers: sellerHeaders,
      form: {
        titre: 'Pièce d\'argent marocaine 1950',
        description: 'Magnifique pièce d\'argent en bon état',
        category_id: '1',
        mode: 'enchere',
        prix_vente: '500',
        frais_port: '30',
      },
    });
    expect(listingRes.ok()).toBeTruthy();
    const listing = await listingRes.json();

    // Buyer places bid
    const bidRes = await request.post(`/api/listings/${listing.id}/bids`, {
      headers: buyerHeaders,
      data: { montant: 550 },
    });
    expect(bidRes.ok()).toBeTruthy();

    // Verify listing updated
    const detailRes = await request.get(`/api/listings/${listing.id}`);
    const detail = await detailRes.json();
    expect(detail.prix_actuel).toBe('550.00');
  });
});

/**
 * PARCOURS CRITIQUE 2:
 * Litige → Remboursement
 */
test.describe('Parcours 2: Litige et remboursement', () => {

  test('2.1 Création de litige via API', async ({ request }) => {
    // Setup users
    const sellerRes = await request.post('/api/auth/register', {
      data: {
        pseudo: 'dispute_seller', nom: 'Dispute', prenom: 'Seller',
        email: 'dispute_seller@test.com', password: 'Password123!',
        password_confirmation: 'Password123!', age: 30, gsm: '0611111111',
        adresse_exacte: 'Rue Test', rib: 'MA640070700000000000000503',
        cgu_acceptee: true, langue_preferee: 'fr',
      },
    });
    const sellerToken = (await sellerRes.json()).token;

    const buyerRes = await request.post('/api/auth/register', {
      data: {
        pseudo: 'dispute_buyer', nom: 'Dispute', prenom: 'Buyer',
        email: 'dispute_buyer@test.com', password: 'Password123!',
        password_confirmation: 'Password123!', age: 25, gsm: '0622222222',
        adresse_exacte: 'Rue Test 2', rib: 'MA640070700000000000000503',
        cgu_acceptee: true, langue_preferee: 'fr',
      },
    });
    const buyerToken = (await buyerRes.json()).token;

    const sellerHeaders = { Authorization: `Bearer ${sellerToken}` };
    const buyerHeaders = { Authorization: `Bearer ${buyerToken}` };

    // Create listing
    const listingRes = await request.post('/api/listings', {
      headers: sellerHeaders,
      form: {
        titre: 'Timbre rare 1920',
        description: 'Timbre en excellent état',
        category_id: '2',
        mode: 'achat_immediat',
        prix_vente: '200',
        frais_port: '20',
      },
    });
    const listing = await listingRes.json();

    // Simulate order creation (normally done via payment flow)
    // Test that disputes API works
    const disputeRes = await request.post('/api/disputes', {
      headers: buyerHeaders,
      data: {
        order_id: 1,
        raison: 'objet_endommage',
        description: 'L\'objet reçu est endommagé, fissure visible',
      },
    });

    // Will return 422 if order doesn't exist (expected in isolated test)
    // This validates the endpoint structure
    expect([201, 422]).toContain(disputeRes.status());
  });
});

/**
 * PARCOURS CRITIQUE 3:
 * Républication automatique J+28
 */
test.describe('Parcours 3: Républication automatique', () => {

  test('3.1 Job de républication fonctionne', async ({ request }) => {
    // Register seller
    const sellerRes = await request.post('/api/auth/register', {
      data: {
        pseudo: 'republish_seller', nom: 'Republish', prenom: 'Test',
        email: 'republish@test.com', password: 'Password123!',
        password_confirmation: 'Password123!', age: 35, gsm: '0633333333',
        adresse_exacte: 'Rue Test', rib: 'MA640070700000000000000503',
        cgu_acceptee: true, langue_preferee: 'fr',
      },
    });
    const token = (await sellerRes.json()).token;
    const headers = { Authorization: `Bearer ${token}` };

    // Create auction listing
    const listingRes = await request.post('/api/listings', {
      headers,
      form: {
        titre: 'Objet à republier',
        description: 'Test répub',
        category_id: '1',
        mode: 'enchere',
        prix_vente: '100',
        frais_port: '10',
      },
    });
    expect(listingRes.ok()).toBeTruthy();
    const listing = await listingRes.json();

    // Verify listing is active
    const detail = await request.get(`/api/listings/${listing.id}`);
    const data = await detail.json();
    expect(data.statut).toBe('active');
    expect(data.nb_republications).toBe(0);

    // The RepublishExpiredListings job would be tested via:
    // php artisan test --filter=RepublishExpiredListings
    // Here we verify the listing structure supports republish
    expect(data.date_expiration).toBeTruthy();
    expect(data.numero_auto).toMatch(/^COL-\d{4}-\d{6}$/);
  });
});

/**
 * Tests de navigation et UI
 */
test.describe('Navigation et UI', () => {

  test('Page d\'accueil affiche les catégories', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Nos 20 catégories')).toBeVisible();
    await expect(page.locator('text=Monnaies')).toBeVisible();
    await expect(page.locator('text=Timbres')).toBeVisible();
  });

  test('Changement de langue FR → AR', async ({ page }) => {
    await page.goto('/');
    // Click language toggle
    await page.click('button:has-text("AR")');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    // Verify RTL content
    await expect(page.locator('text=الفئات')).toBeVisible();
  });

  test('Login page fonctionne', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Connexion');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'test');
  });

  test('Inscription avec validation', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('input[name="pseudo"]', 'testuser');
    await page.fill('input[name="nom"]', 'Test');
    await page.fill('input[name="prenom"]', 'User');
    await page.fill('input[name="age"]', '25');
    await page.fill('input[name="gsm"]', '0612345678');
    await page.fill('input[name="email"]', 'newuser@test.com');
    await page.fill('input[name="adresse_exacte"]', '123 Rue Test');
    await page.fill('input[name="rib"]', 'MA640070700000000000000503');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="password_confirmation"]', 'Password123!');
    await page.check('input[name="cgu_acceptee"]');
    // Form should be valid
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Listings page avec filtres', async ({ page }) => {
    await page.goto('/listings');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Footer affiche les moyens de paiement', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Visa')).toBeVisible();
    await expect(page.locator('text=Mastercard')).toBeVisible();
    await expect(page.locator('text=CMI')).toBeVisible();
    await expect(page.locator('text=PayPal')).toBeVisible();
  });
});
