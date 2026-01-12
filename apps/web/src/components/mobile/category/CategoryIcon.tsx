'use client';

import {
  Shirt,
  Utensils,
  Home,
  ChefHat,
  Bed,
  Sparkles,
  Baby,
  Plane,
  Grid3X3,
  type LucideIcon,
} from 'lucide-react';

// 分类图标映射
const iconMap: Record<string, LucideIcon> = {
  shirt: Shirt,
  utensils: Utensils,
  home: Home,
  'chef-hat': ChefHat,
  bed: Bed,
  sparkles: Sparkles,
  baby: Baby,
  plane: Plane,
  all: Grid3X3,
};

interface CategoryIconProps {
  icon: string | null;
  className?: string;
  size?: number;
}

export function CategoryIcon({ icon, className, size = 20 }: CategoryIconProps) {
  const IconComponent = icon ? iconMap[icon] || Grid3X3 : Grid3X3;
  return <IconComponent className={className} size={size} />;
}
