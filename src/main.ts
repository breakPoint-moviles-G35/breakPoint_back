import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();