import { useTranslation } from 'react-i18next';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isLight = variant === 'light';

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const imgSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center gap-2.5 ${isAr ? 'flex-row-reverse' : ''}`}>
      <img
        src="/logo.png"
        alt="collection.ma"
        className={`${imgSizes[size]} object-contain`}
      />
      <span
        className={`font-serif font-bold ${sizes[size]} ${
          isLight ? 'text-white' : 'text-cream'
        }`}
      >
        collection.ma
      </span>
    </div>
  );
}
