/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/server/services/locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: {
      validation: (await import(`./locales/${locale}/validation.json`)).default,
      // others will be added here
    }
  };
});