import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { listingsApi, categoriesApi } from '@/api';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

export function AddListingPage() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId && editId !== 'new';

  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditing);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    category_id: '',
    mode: 'enchere',
    prix_vente: '',
    frais_port: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    categoriesApi.list()
      .then(({ data }) => {
        const active = (Array.isArray(data) ? data : []).filter((c) => c.active !== false);
        active.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        setCategories(active);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditing || !editId) return;
    listingsApi.get(Number(editId))
      .then(({ data }) => {
        setForm({
          titre: data.titre || '',
          description: data.description || '',
          category_id: String(data.category_id ?? ''),
          mode: data.mode || 'enchere',
          prix_vente: data.prix_vente != null ? String(data.prix_vente) : '',
          frais_port: data.frais_port != null ? String(data.frais_port) : '',
        });
      })
      .catch(() => setError(t('commun.erreur')))
      .finally(() => setLoadingEdit(false));
  }, [isEditing, editId, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files).slice(0, 20));
    }
  };

  const total = (parseFloat(form.prix_vente) || 0) + (parseFloat(form.frais_port) || 0);

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await listingsApi.update(Number(editId), {
          titre: form.titre,
          description: form.description,
          category_id: form.category_id,
          mode: form.mode,
          prix_vente: form.prix_vente,
          frais_port: form.frais_port || null,
        });
        navigate('/vendeur/objets');
        return;
      }

      const formData = new FormData();
      formData.append('titre', form.titre);
      formData.append('description', form.description);
      formData.append('category_id', form.category_id);
      formData.append('mode', form.mode);
      formData.append('prix_vente', form.prix_vente);
      if (form.frais_port) formData.append('frais_port', form.frais_port);
      if (asDraft) formData.append('statut', 'brouillon');
      photos.forEach((photo) => formData.append('photos[]', photo));

      const { data } = await listingsApi.create(formData);
      navigate(`/listings/${data.numero_auto}`);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(', '));
      } else {
        setError(err.response?.data?.message || t('commun.erreur'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="card p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-navy-hover rounded w-1/3" />
        <div className="h-4 bg-navy-hover rounded w-1/2" />
        <div className="h-4 bg-navy-hover rounded w-2/3" />
      </div>
    );
  }

  return (
    <div>
      <h1 className={cn('text-2xl font-serif font-bold text-cream mb-6', isAr && 'text-right')}>
        {isEditing ? (isAr ? 'تعديل الإعلان' : 'Modifier l\'annonce') : t('formulaire.ajouter_objet')}
      </h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red/10 text-red rounded-lg text-sm">{error}</div>
        )}

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {t('formulaire.titre')} *
          </label>
          <input
            name="titre"
            value={form.titre}
            onChange={handleChange}
            className="input-field"
            required
            maxLength={300}
            placeholder={isAr ? 'أدخل عنوان المنتج' : 'Titre de votre objet'}
          />
        </div>

        {!isEditing && (
          <>
            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-cream mb-1">
                {t('formulaire.photos')} (max 20)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotos}
                className="input-field file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gold file:text-white file:cursor-pointer"
              />
              {photos.length > 0 && (
                <p className="text-xs text-text-subdued mt-1">
                  {photos.length} {isAr ? 'صورة محددة' : 'photo(s) sélectionnée(s)'}
                </p>
              )}
            </div>
          </>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {t('formulaire.description')} *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field min-h-[120px]"
            required
            placeholder={isAr ? 'وصف تفصيلي للمنتج' : 'Description détaillée de votre objet'}
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {t('formulaire.categorie')} *
          </label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">{isAr ? 'اختر فئة' : 'Sélectionner une catégorie'}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {isAr ? cat.nom_ar : cat.nom_fr}
              </option>
            ))}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium text-cream mb-2">
            {t('formulaire.mode')} *
          </label>
          <div className={cn('flex gap-4', isAr && 'flex-row-reverse')}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="enchere"
                checked={form.mode === 'enchere'}
                onChange={handleChange}
                className="accent-gold"
              />
              <span className="text-sm text-cream">⏱ {t('formulaire.enchere')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="achat_immediat"
                checked={form.mode === 'achat_immediat'}
                onChange={handleChange}
                className="accent-gold"
              />
              <span className="text-sm text-cream">{t('formulaire.achat_immadiat')}</span>
            </label>
          </div>
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {t('formulaire.prix_vente')} (MAD) *
            </label>
            <input
              name="prix_vente"
              type="number"
              step="0.01"
              min="0"
              value={form.prix_vente}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream mb-1">
              {t('formulaire.frais_port')} (MAD)
            </label>
            <input
              name="frais_port"
              type="number"
              step="0.01"
              min="0"
              value={form.frais_port}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Total calculé */}
        <div className="bg-navy-hover rounded-lg p-4">
          <label className="block text-sm font-medium text-cream mb-1">
            {t('formulaire.total_calcule')}
          </label>
          <p className="text-2xl font-bold text-cream">
            {total.toFixed(2)} MAD
          </p>
        </div>

        {/* Submit */}
        <div className={cn('flex gap-4', isAr && 'flex-row-reverse')}>
          <button type="submit" disabled={loading} className="btn-gold disabled:opacity-50">
            {loading ? '...' : isEditing ? (isAr ? 'حفظ التعديلات' : 'Enregistrer') : t('formulaire.publier')}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
              className="btn-gold-outline disabled:opacity-50"
            >
              {loading ? '...' : t('formulaire.enregistrer_brouillon')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}