import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../user/entities/user/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Script simple para crear solo usuarios básicos
 * Útil cuando solo necesitas usuarios de prueba sin datos complejos
 */
async function createBasicUsers() {
  console.log('🌱 Creando usuarios básicos...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Verificar si ya existen usuarios
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log(`⚠️  Ya existen ${existingUsers} usuarios en la base de datos`);
      console.log('Si quieres crear usuarios adicionales, modifica este script');
      return;
    }

    const basicUsers: Partial<User>[] = [
      {
        name: 'Admin Test',
        email: 'admin@uniandes.edu.co',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        status: 'active'
      },
      {
        name: 'Host Test',
        email: 'host@uniandes.edu.co',
        password: await bcrypt.hash('host123', 10),
        role: UserRole.HOST,
        status: 'active'
      },
      {
        name: 'Student Test',
        email: 'student@uniandes.edu.co',
        password: await bcrypt.hash('student123', 10),
        role: UserRole.STUDENT,
        status: 'active'
      }
    ];

    const createdUsers = await userRepo.save(basicUsers);
    console.log(`✅ ${createdUsers.length} usuarios básicos creados:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createBasicUsers().catch(console.error);
}

export { createBasicUsers };
