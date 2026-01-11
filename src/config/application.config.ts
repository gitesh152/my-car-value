import { registerAs } from '@nestjs/config';

export const applicationConfig = registerAs('application', () => {
  return {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    cookieKey: process.env.COOKIE_KEY,
    dummyPassword: process.env.DUMMY_PASSWORD,
    adminEmail: process.env.SUPERADMIN_EMAIL,
  };
});
