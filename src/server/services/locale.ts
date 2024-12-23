'use server';

import { cookies } from 'next/headers';
import { type Locale, defaultLocale } from '@/i18n/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale(): Promise<Locale> {
  const extractedCookies = await cookies();
  const localeCookie = extractedCookies.get(COOKIE_NAME);
  if (localeCookie?.value !== "en" && localeCookie?.value !== "ru") {  // if (!["en", "ru"].includes(localeCookie?.value ?? "")) {
    return defaultLocale;
  }
  return localeCookie?.value ?? defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const extractedCookies = await cookies();
  extractedCookies.delete(COOKIE_NAME);
  extractedCookies.set(COOKIE_NAME, locale);
}