/// <reference types="vite/client" />

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  export type Icon = FC<LucideProps>;
  export type LucideIcon = FC<LucideProps>;

  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Phone: LucideIcon;
  export const Mail: LucideIcon;
  export const Weight: LucideIcon;
  export const Ruler: LucideIcon;
  export const FileText: LucideIcon;
  export const HeartPulse: LucideIcon;
  export const Ban: LucideIcon;
  export const Apple: LucideIcon;
  export const Target: LucideIcon;
  export const Plus: LucideIcon;
  export const Calendar: LucideIcon;
  export const History: LucideIcon;
  export const PlayCircle: LucideIcon;
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const Utensils: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const XCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Flame: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const Edit2: LucideIcon;
  export const Check: LucideIcon;
  export const X: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Info: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Settings: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const Dumbbell: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Tag: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Award: LucideIcon;
  export const Copy: LucideIcon;
  export const Save: LucideIcon;
  export const LayoutGrid: LucideIcon;
  export const ListFilter: LucideIcon;
  export const Bell: LucideIcon;
  export const BarChart2: LucideIcon;
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;
  export const Monitor: LucideIcon;

  const icon: LucideIcon;
  export default icon;
}
