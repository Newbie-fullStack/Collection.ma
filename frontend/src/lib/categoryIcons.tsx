import {
  Coins, Stamp, Banknote, Watch, Mail, Gem, Landmark, CupSoda,
  Cog, ScrollText, BookOpen, Car, Medal, Shirt, Shield, Layers,
  Grid3x3, Cpu, Package, CircleDollarSign
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  coin: Coins,
  stamp: Stamp,
  banknote: Banknote,
  watch: Watch,
  mail: Mail,
  envelope: Mail,
  gem: Gem,
  landmark: Landmark,
  cup: CupSoda,
  cog: Cog,
  scroll: ScrollText,
  book: BookOpen,
  car: Car,
  medal: Medal,
  shirt: Shirt,
  shield: Shield,
  layers: Layers,
  grid: Grid3x3,
  cpu: Cpu,
  package: Package,
};

export function categoryIcon(icon?: string | null): LucideIcon {
  return (icon && ICON_MAP[icon]) || CircleDollarSign;
}
