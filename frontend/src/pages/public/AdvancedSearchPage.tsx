import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categoriesApi } from '@/api';
import type { Category } from '@/types';

export function AdvancedSearchPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    q: '',
    category_id: '',
    mode: '',
    prix_min: '',
    prix_max: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
  });

  useEffect(() => {
    categoriesApi.list()
      .then(({ data }) => {
        const active = (Array.isArray(data) ? data : []).filter((c) => c.active !== false);
        active.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        setCategories(active);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.q) params.set('q', form.q);
    if (form.category_id) params.set('category', form.category_id);
    if (form.mode) params.set('mode', form.mode);
    if (form.prix_min) params.set('prix_min', form.prix_min);
    if (form.prix_max) params.set('prix_max', form.prix_max);
    if (form.sort_by) params.set('sort_by', form.sort_by);
    if (form.sort_dir) params.set('sort_dir', form.sort_dir);
    navigate(`/listings?${params.toString()}`);
  };

  const categories = [
    { id: 1, label: 'Monnaies / عملات' },
    { id: 2, label: 'Timbres / طوابع' },
    { id: 3, label: 'Billets / نقود ورقية' },
    { id: 4, label: 'Montres / ساعات' },
    { id: 5, label: 'Cartes postales / بطاقات بريدية' },
    { id: 6, label: 'Enveloppes / ظرف' },
    { id: 7, label: 'Bijoux / مجوهرات' },
    { id: 8, label: 'Statues / تماثيل' },
    { id: 9, label: 'Céramiques / سيراميك' },
    { id: 10, label: 'Machinerie / آلات' },
    { id: 11, label: 'Manuscrits / مخطوطات' },
    { id: 12, label: 'Livres anciens / كتب قديمة' },
    { id: 13, label: 'Voitures miniatures / سيارات مصغرة' },
    { id: 14, label: 'Bronzes / برونز' },
    { id: 15, label: 'Habillements anciens / ملابس قديمة' },
    { id: 16, label: 'Militaria / عسكريات' },
    { id: 17, label: 'Cartes Pokémon / كروت بوكيمون' },
    { id: 18, label: 'Collections complètes / مجموعات كاملة' },
    { id: 19, label: 'Science & Technique / علوم وتكنولوجيا' },
    { id: 20, label: 'Divers / متنوع' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className={cn('text-3xl font-serif font-bold text-cream mb-8', isAr && 'text-right')}>
        {isAr ? 'بحث متقدم' : 'Recherche avancée'}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Mots-clés */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {isAr ? 'كلمات مفتاحية' : 'Mots-clés'}
          </label>
          <input
            name="q"
            value={form.q}
            onChange={handleChange}
            className="input-field"
            placeholder={isAr ? 'ابحث عن...' : 'Rechercher...'}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {isAr ? 'الفئة' : 'Catégorie'}
          </label>
          <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field">
            <option value="">{isAr ? 'جميع الفئات' : 'Toutes les catégories'}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{isAr ? cat.nom_ar : cat.nom_fr}</option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {isAr ? 'طريقة البيع' : 'Mode de vente'}
          </label>
          <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
            <option value="">{isAr ? 'الكل' : 'Tous'}</option>
            <option value="enchere">{isAr ? 'licitة' : 'Enchère'}</option>
            <option value="achat_immediat">{isAr ? 'شراء مباشر' : 'Achat immédiat'}</option>
          </select>
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {isAr ? 'السعر الأدنى' : 'Prix min (MAD)'}
            </label>
            <input name="prix_min" type="number" min="0" value={form.prix_min} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {isAr ? 'السعر الأقصى' : 'Prix max (MAD)'}
            </label>
            <input name="prix_max" type="number" min="0" value={form.prix_max} onChange={handleChange} className="input-field" />
          </div>
        </div>

        {/* Tri */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {isAr ? 'ترتيب حسب' : 'Trier par'}
            </label>
            <select name="sort_by" value={form.sort_by} onChange={handleChange} className="input-field">
              <option value="created_at">{isAr ? 'التاريخ' : 'Date'}</option>
              <option value="prix_actuel">{isAr ? 'السعر' : 'Prix'}</option>
              <option value="nb_vues">{isAr ? 'المشاهدات' : 'Vues'}</option>
              <option value="nb_favoris">{isAr ? 'المفضلة' : 'Favoris'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {isAr ? 'الاتجاه' : 'Direction'}
            </label>
            <select name="sort_dir" value={form.sort_dir} onChange={handleChange} className="input-field">
              <option value="desc">{isAr ? 'تنازلي' : 'Décroissant'}</option>
              <option value="asc">{isAr ? 'تصاعدي' : 'Croissant'}</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-gold flex items-center gap-2">
          <Search className="w-4 h-4" />
          {isAr ? 'بحث' : 'Rechercher'}
        </button>
      </form>
    </div>
  );
}
