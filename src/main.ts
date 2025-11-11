import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import os from 'node:os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  
  // Enable CORS
  app.enableCors({ origin: true, credentials: true });
  
  // Simple request logger (runs before guards/controllers)
  app.use((req: any, _res: any, next: any) => {
    const authHeader: string | undefined = req.headers?.authorization as string | undefined;
    const hasAuth = Boolean(authHeader);
    const authPreview = authHeader ? `${authHeader.slice(0, 16)}...` : 'none';
    // Avoid logging large bodies
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    app.getHttpAdapter().getInstance().logger?.debug?.(`[HTTP] ${req.method} ${req.url} auth=${hasAuth} bearer=${authPreview}`);
    // Fallback to console
    // eslint-disable-next-line no-console
    console.log(`[HTTP] ${req.method} ${req.url} auth=${hasAuth} bearer=${authPreview}`);
    next();
  });
  
  const port = Number(process.env.PORT ?? 3000);
  const host = '0.0.0.0';
  await app.listen(port, host);

  // Log URLs disponibles
  const url = await app.getUrl();
  // eslint-disable-next-line no-console
  console.log(`[Nest] Listening on ${url} (host=${host}, port=${port})`);
  const nets = os.networkInterfaces();
  Object.entries(nets).forEach(([ifaceName, entries]) => {
    entries?.forEach((ni) => {
      const family = (ni as unknown as { family: string | number }).family;
      const isIPv4 = family === 'IPv4' || family === 4;
      if (!ni.internal && isIPv4) {
        // eslint-disable-next-line no-console
        console.log(`LAN URL (${ifaceName}): http://${ni.address}:${port}/`);
      }
    });
  });
}
bootstrap();