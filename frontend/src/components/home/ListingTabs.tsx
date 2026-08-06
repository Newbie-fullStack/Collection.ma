import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TabOption {
  key: string;
  label: string;
}

interface ListingTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function ListingTabs({ tabs, activeTab, onChange }: ListingTabsProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className={cn('flex items-center gap-1 border-b border-gold/15', isAr && 'flex-row-reverse')}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-gold text-gold'
              : 'border-transparent text-text-subdued hover:text-cream',
            isAr && 'text-right'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
