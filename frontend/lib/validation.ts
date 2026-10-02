/* Daraz-style checkout validation for Pakistani shoppers. */

export const PK_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Larkana',
  'Mardan',
  'Swat',
  'Jhelum',
  'Gujrat',
  'Sahiwal',
  'Okara',
  'Wah Cantonment',
  'Dera Ghazi Khan',
  'Sheikhupura',
  'Kasur',
  'Rahim Yar Khan',
  'Jhang',
  'Attock',
  'Muzaffarabad',
];

/** Keep only digits — used for the phone field. */
export function normalizePhone(v: string): string {
  return v.replace(/\D/g, '').slice(0, 11);
}

/** Pakistani mobile: exactly 11 digits starting with 03 (e.g. 03001234567). */
export function validatePhone(v: string): string | null {
  const d = normalizePhone(v);
  if (!d) return 'Please enter your mobile number.';
  if (!/^03\d{9}$/.test(d))
    return 'Enter a valid 11-digit mobile number starting with 03 (e.g. 03001234567).';
  return null;
}

export function validateName(v: string): string | null {
  const t = v.trim();
  if (!t) return 'Please enter your full name.';
  if (t.length < 3) return 'Name must be at least 3 characters.';
  if (!/^[a-zA-Z\s.'-]+$/.test(t)) return 'Name can only contain letters.';
  return null;
}

export function validateEmail(v: string): string | null {
  const t = v.trim();
  if (!t) return null; // optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Please enter a valid email address.';
  return null;
}

export function validateAddress(v: string): string | null {
  const t = v.trim();
  if (!t) return 'Please enter your street address.';
  if (t.length < 10) return 'Please enter your complete address (house, street, area).';
  return null;
}

export function validateCity(v: string): string | null {
  if (!v.trim()) return 'Please select your city.';
  return null;
}

export function validatePostal(v: string): string | null {
  const t = v.trim();
  if (!t) return null; // optional
  if (!/^\d{5}$/.test(t)) return 'Postal code must be 5 digits.';
  return null;
}

/** Delivery date must be at least tomorrow (cakes are baked fresh to order). */
export function validateDeliveryDate(v: string): string | null {
  if (!v) return 'Please choose a delivery date.';
  const picked = new Date(v + 'T00:00:00');
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isNaN(picked.getTime())) return 'Please choose a valid date.';
  if (picked < tomorrow)
    return 'Delivery date must be at least tomorrow — we bake fresh to order!';
  return null;
}

export function validateCakeMessage(v: string): string | null {
  if (v.length > 40) return 'Keep the message under 40 characters.';
  return null;
}

export interface ShippingForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  deliveryDate: string;
}

export function validateShippingForm(f: ShippingForm): Record<keyof ShippingForm, string | null> {
  return {
    name: validateName(f.name),
    phone: validatePhone(f.phone),
    email: validateEmail(f.email),
    address: validateAddress(f.address),
    city: validateCity(f.city),
    postal: validatePostal(f.postal),
    deliveryDate: validateDeliveryDate(f.deliveryDate),
  };
}
