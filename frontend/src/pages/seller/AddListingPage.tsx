import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { listingsApi, categoriesApi } from '@/api';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import { Star, X, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';

interface PhotoPreview {
  file: File;
  url: string;
}

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
  const [scheduledAt, setScheduledAt] = useState('');
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const photosRef = useRef<PhotoPreview[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

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
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 20 - photos.length);
    const next = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].url);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, dir: -1 | 1) => {
    setPhotos((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
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
      if (scheduledAt && !asDraft) {
        formData.append('date_publication_planifiee', new Date(scheduledAt).toISOString());
        formData.append('statut', 'brouillon');
      }
      photos.forEach((photo) => formData.append('photos[]', photo.file));

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
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-text-subdued">
                      {photos.length} {isAr ? 'صورة محددة' : 'photo(s) sélectionnée(s)'}
                    </p>
                    <span className="text-[11px] text-gold">
                      {isAr ? 'الأولى هي الصورة الرئيسية' : 'La première est la photo principale'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {photos.map((photo, i) => (
                      <div
                        key={photo.url}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border',
                          i === 0 ? 'border-gold' : 'border-navy-hover'
                        )}
                      >
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 p-1 rounded-full bg-gold text-white">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1">
                          <button
                            type="button"
                            onClick={() => movePhoto(i, -1)}
                            disabled={i === 0}
                            className={cn('p-1 text-white hover:text-gold', i === 0 && 'opacity-30')}
                            title={isAr ? 'تحريك لليسار' : 'Déplacer avant'}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="p-1 text-red hover:text-red"
                            title={isAr ? 'حذف' : 'Supprimer'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePhoto(i, 1)}
                            disabled={i === photos.length - 1}
                            className={cn('p-1 text-white hover:text-gold', i === photos.length - 1 && 'opacity-30')}
                            title={isAr ? 'تحريك لليمين' : 'Déplacer après'}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {photos.length < 20 && (
                      <label className="aspect-square rounded-lg border border-dashed border-gold/30 flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
                        <ImagePlus className="w-6 h-6 text-text-subdued" />
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotos} />
                      </label>
                    )}
                  </div>
                </div>
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

        {/* Programmation */}
        <div>
          <label className="block text-sm font-medium text-cream mb-1">
            {isAr ? 'جدولة النشر (اختياري)' : 'Programmer la publication (optionnel)'}
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            className="input-field"
          />
          <p className="text-xs text-text-subdued mt-1">
            {isAr
              ? 'إذا حددت تاريخًا، سيُحفظ الإعلان كمسودة ويُنشر تلقائيًا'
              : 'Si une date est définie, l\'annonce reste en brouillon et est publiée automatiquement'}
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