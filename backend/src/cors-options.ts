import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/** CORS da API — Bearer token no frontend, sem cookies (`credentials: false`). */
export const nestCorsOptions: CorsOptions = {
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
};
