import { Scissors, Palette, Sparkles, Flower2, Brush, Hand, Leaf, type LucideIcon } from "lucide-react";

export const CATEGORIES: { name: string; icon: LucideIcon; blurb: string }[] = [
  { name: "Haircut & Styling", icon: Scissors, blurb: "Precision cuts & blow-dries" },
  { name: "Hair Coloring", icon: Palette, blurb: "Balayage, highlights & tints" },
  { name: "Hair Treatment", icon: Sparkles, blurb: "Keratin, spa & repair" },
  { name: "Facial & Skincare", icon: Flower2, blurb: "Glow-boosting facials" },
  { name: "Makeup", icon: Brush, blurb: "Bridal, party & editorial" },
  { name: "Manicure & Pedicure", icon: Hand, blurb: "Gel, nail art & spa care" },
  { name: "Spa & Massage", icon: Leaf, blurb: "Relaxing body therapies" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

export const SALON_INFO = {
  name: "SalonBook",
  phone: "+1 (555) 214-7788",
  email: "hello@salonbook.app",
  address: "128 Rosewood Avenue, Suite 4, Springfield, IL 62701",
  hours: [
    { days: "Mon – Fri", time: "9:00 AM – 7:00 PM" },
    { days: "Saturday", time: "9:00 AM – 6:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
};
