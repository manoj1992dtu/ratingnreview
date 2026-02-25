/**
 * Map icon names from database to actual icon components
 */
export function getIconName(iconString?: string): string {
  const iconMap: Record<string, string> = {
    'code': 'Code',
    'building-2': 'Building2',
    'dollar-sign': 'DollarSign',
    'shopping-bag': 'ShoppingBag',
    'graduation-cap': 'GraduationCap',
    'briefcase': 'Briefcase',
    'megaphone': 'Megaphone',
    'factory': 'Factory',
    'hammer': 'Hammer',
    'film': 'Film',
    'truck': 'Truck',
    'coffee': 'Coffee',
    'box': 'Box',
    'zap': 'Zap',
    'home': 'Home',
    'wifi': 'Wifi',
    'phone': 'Phone',
    'plane': 'Plane',
    'cpu': 'Cpu',
    'lock': 'Lock',
    'cloud': 'Cloud',
    'monitor': 'Monitor',
    'globe': 'Globe',
    'pill': 'Pill',
    'dna': 'Dna',
    'stethoscope': 'Stethoscope',
    'smartphone': 'Smartphone',
    'building': 'Building',
    'credit-card': 'CreditCard',
    'shield': 'Shield',
    'wheat': 'Wheat',
    'bar-chart-2': 'BarChart2',
    'calculator': 'Calculator',
    'recycle': 'Recycle',
    'flame': 'Flame',
    'battery': 'Battery',
    'wrench': 'Wrench',
    'rocket': 'Rocket',
    'star': 'Star',
    'refresh-ccw': 'RefreshCcw',
    'user': 'User',
    'rainbow': 'Rainbow',
    'users': 'Users',
    'paw-print': 'PawPrint',
    'leaf': 'Leaf',
    'handshake': 'Handshake',
    'beaker': 'Beaker',
    'package': 'Package',
    'plug': 'Plug',
    'gamepad': 'Gamepad',
    'scale': 'Scale',
    'landmark': 'Landmark',
    'thread': 'Thread',
    'microscope': 'Microscope',
    'broom': 'Broom',
    'heart': 'Heart',
    'dumbbell': 'Dumbbell',
    'brush': 'Brush',
    'bitcoin': 'Bitcoin',
    'sun': 'Sun',
    'tooth': 'Tooth',
    'party-popper': 'PartyPopper',
    'sofa': 'Sofa',
    'camera': 'Camera',
    'baby': 'Baby',
    'trophy': 'Trophy',
    'music': 'Music',
    'droplets': 'Droplets',
    'feather': 'Feather',
    'gem': 'Gem',
    'link': 'Link',
    'umbrella': 'Umbrella',
    'calendar': 'Calendar',
    'gift': 'Gift',
    'trending-up': 'TrendingUp',
    'target': 'Target',
    'file-text': 'FileText',
    'clock': 'Clock',
    'school': 'School',
    'store': 'Store',
    'mountain': 'Mountain',
    'smile': 'Smile',
    'bridge': 'Bridge',
    'medal': 'Medal',
    'accessibility': 'Accessibility',
    'settings': 'Settings',
    'test-tube': 'TestTube'
  };

  return iconMap[iconString || ''] || 'Briefcase';
}

/**
 * Get color classes based on industry name or a hash
 */
export function getIndustryColor(industryName: string): string {
  const colors = [
    'bg-indigo-100 text-primary',
    'bg-green-100 text-green-600',
    'bg-red-100 text-red-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-gray-100 text-gray-600',
    'bg-yellow-100 text-yellow-600',
    'bg-indigo-100 text-indigo-600',
    'bg-orange-100 text-orange-600',
    'bg-rose-100 text-rose-600',
    'bg-cyan-100 text-cyan-600',
    'bg-teal-100 text-teal-600',
    'bg-amber-100 text-amber-600',
    'bg-lime-100 text-lime-600',
    'bg-emerald-100 text-emerald-600',
    'bg-slate-100 text-slate-600',
    'bg-sky-100 text-sky-600',
    'bg-violet-100 text-violet-600',
    'bg-fuchsia-100 text-fuchsia-600',
  ];

  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < industryName.length; i++) {
    hash = industryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format search volume for display
 */
export function formatSearchVolume(volume?: number): string | null {
  if (!volume) return null;
  
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K/mo`;
  }
  
  return `${volume}/mo`;
}
