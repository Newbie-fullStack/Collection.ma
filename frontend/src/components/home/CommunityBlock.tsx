import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CounterProps {
  target: number;
  prefix?: string;
  duration?: number;
}

function AnimatedCounter({ target, prefix = '+', duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            setCount((prev) => {
              if (prev + increment >= target) {
                clearInterval(timer);
                return target;
              }
              return prev + increment;
            });
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="font-bold text-3xl text-gold">
      {prefix}{Math.floor(count).toLocaleString()}
    </span>
  );
}

export function CommunityBlock() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="bg-navy-card border border-gold/15 py-12 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className={cn('text-2xl font-serif font-bold text-cream mb-8', isAr && 'text-right')}>
          {t('accueil.communaute.titre')}
        </h2>

        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter target={12000} />
            <span className="text-text-subdued text-sm">{t('accueil.communaute.membres')}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter target={45000} />
            <span className="text-text-subdued text-sm">{t('accueil.communaute.objets')}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AnimatedCounter target={1200} />
            <span className="text-text-subdued text-sm">{t('accueil.communaute.encheres')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
