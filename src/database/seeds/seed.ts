import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../user/entities/user/user.entity';
import { HostProfile } from '../../host-profile/entities/host-profile.entity/host-profile.entity';
import { Space } from '../../space/entities/space.entity/space.entity';
import { InventorySlotEntity, SlotStatus } from '../../inventory-slot/entities/inventory-slot.entity/inventory-slot.entity';
import { Booking, BookingStatus } from '../../booking/entities/booking.entity/booking.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface SeedData {
  users: Partial<User>[];
  hostProfiles: Partial<HostProfile>[];
  spaces: Partial<Space>[];
  inventorySlots: Partial<InventorySlotEntity>[];
  bookings: Partial<Booking>[];
}

async function generateSeedData(): Promise<SeedData> {
  // Generar usuarios
  const users: Partial<User>[] = [
    // Usuarios Admin
    {
      name: 'Juan Carlos Admin',
      email: 'juan.admin@uniandes.edu.co',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      status: 'active'
    },
    // Usuarios Host
    {
      name: 'María González Host',
      email: 'maria.host@uniandes.edu.co',
      password: await bcrypt.hash('host123', 10),
      role: UserRole.HOST,
      status: 'active'
    },
    {
      name: 'Carlos Rodríguez Host',
      email: 'carlos.host@uniandes.edu.co',
      password: await bcrypt.hash('host123', 10),
      role: UserRole.HOST,
      status: 'active'
    },
    {
      name: 'Ana Martínez Host',
      email: 'ana.host@uniandes.edu.co',
      password: await bcrypt.hash('host123', 10),
      role: UserRole.HOST,
      status: 'active'
    },
    // Usuarios Student
    {
      name: 'Luis Pérez Student',
      email: 'luis.student@uniandes.edu.co',
      password: await bcrypt.hash('student123', 10),
      role: UserRole.STUDENT,
      status: 'active'
    },
    {
      name: 'Sofia García Student',
      email: 'sofia.student@uniandes.edu.co',
      password: await bcrypt.hash('student123', 10),
      role: UserRole.STUDENT,
      status: 'active'
    },
    {
      name: 'Diego López Student',
      email: 'diego.student@uniandes.edu.co',
      password: await bcrypt.hash('student123', 10),
      role: UserRole.STUDENT,
      status: 'active'
    },
    {
      name: 'Valentina Torres Student',
      email: 'valentina.student@uniandes.edu.co',
      password: await bcrypt.hash('student123', 10),
      role: UserRole.STUDENT,
      status: 'active'
    }
  ];

  // Generar host profiles (se crearán después de los usuarios)
  const hostProfiles: Partial<HostProfile>[] = [
    {
      verification_status: 'verified',
      payout_method: 'bank_transfer'
    },
    {
      verification_status: 'pending',
      payout_method: 'paypal'
    },
    {
      verification_status: 'verified',
      payout_method: 'bank_transfer'
    }
  ];

  // Generar espacios (se crearán después de los host profiles)
  const spaces: Partial<Space>[] = [
    {
      title: 'Sala de Estudio Silenciosa - Edificio ML',
      subtitle: 'Ambiente perfecto para estudio individual',
      geo: 'Universidad de los Andes - Edificio Mario Laserna',
      capacity: 1,
      amenities: ['WiFi', 'Mesa individual', 'Silla ergonómica', 'Iluminación natural', 'Tomacorrientes'],
      accessibility: ['Acceso en silla de ruedas', 'Ascensor disponible'],
      imageUrl: 'https://example.com/sala-estudio-ml.jpg',
      rules: 'No hablar en voz alta, mantener el espacio limpio, respetar el horario de cierre',
      price: 15000,
      rating_avg: 4.8
    },
    {
      title: 'Sala de Reuniones Grupales - Edificio SD',
      subtitle: 'Ideal para trabajo en equipo y presentaciones',
      geo: 'Universidad de los Andes - Edificio Santo Domingo',
      capacity: 6,
      amenities: ['WiFi', 'Proyector', 'Pizarra', 'Mesa grande', 'Sillas cómodas', 'Aire acondicionado'],
      accessibility: ['Acceso en silla de ruedas'],
      imageUrl: 'https://example.com/sala-reunion-sd.jpg',
      rules: 'Reservar con anticipación, limpiar después de usar, reportar problemas técnicos',
      price: 25000,
      rating_avg: 4.6
    },
    {
      title: 'Área de Coworking - Edificio W',
      subtitle: 'Espacio colaborativo con ambiente dinámico',
      geo: 'Universidad de los Andes - Edificio W',
      capacity: 4,
      amenities: ['WiFi', 'Mesa compartida', 'Sillas ajustables', 'Cafetera', 'Microondas', 'Impresora'],
      accessibility: ['Acceso en silla de ruedas'],
      imageUrl: 'https://example.com/coworking-w.jpg',
      rules: 'Respetar a otros usuarios, mantener volumen bajo, limpiar después de comer',
      price: 20000,
      rating_avg: 4.4
    },
    {
      title: 'Sala de Proyectos - Edificio I',
      subtitle: 'Perfecta para desarrollo de proyectos académicos',
      geo: 'Universidad de los Andes - Edificio I',
      capacity: 8,
      amenities: ['WiFi', 'Computadores', 'Proyector', 'Pizarra digital', 'Mesa de trabajo', 'Sillas ergonómicas'],
      accessibility: ['Acceso en silla de ruedas', 'Ascensor disponible'],
      imageUrl: 'https://example.com/sala-proyectos-i.jpg',
      rules: 'No instalar software sin autorización, respetar equipos, limpiar al finalizar',
      price: 30000,
      rating_avg: 4.9
    },
    {
      title: 'Espacio de Lectura - Biblioteca',
      subtitle: 'Ambiente tranquilo para lectura y estudio',
      geo: 'Universidad de los Andes - Biblioteca General',
      capacity: 2,
      amenities: ['WiFi', 'Mesa para dos', 'Sillas cómodas', 'Iluminación adecuada', 'Estanterías con libros'],
      accessibility: ['Acceso en silla de ruedas', 'Ascensor disponible'],
      imageUrl: 'https://example.com/lectura-biblioteca.jpg',
      rules: 'Silencio absoluto, no comer, respetar horarios de biblioteca',
      price: 12000,
      rating_avg: 4.7
    }
  ];

  // Generar slots de inventario (se crearán después de los espacios)
  const inventorySlots: Partial<InventorySlotEntity>[] = [];
  const baseDate = new Date();
  
  // Generar slots para los próximos 30 días
  for (let day = 0; day < 2; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + day);
    
    // Generar slots de 2 horas desde las 8 AM hasta las 8 PM
    for (let hour = 8; hour < 20; hour += 2) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + 2, 0, 0, 0);
      
      // Crear slots para cada espacio (5 espacios)
      for (let spaceIndex = 0; spaceIndex < 5; spaceIndex++) {
        const statuses = [SlotStatus.OPEN, SlotStatus.OPEN, SlotStatus.OPEN, SlotStatus.BOOKED, SlotStatus.HOLD];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        inventorySlots.push({
          status: randomStatus,
          price: (spaces[spaceIndex]?.price || 15000) + Math.floor(Math.random() * 5000) // Variación de precio
        });
      }
    }
  }

  // Generar reservas de ejemplo (se crearán después de los slots)
  const bookings: Partial<Booking>[] = [
    {
      slot_start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      slot_end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 horas después
      status: BookingStatus.CONFIRMED,
      total_amount: 15000,
      currency: 'COP'
    },
    {
      slot_start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
      slot_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: BookingStatus.PENDING,
      total_amount: 25000,
      currency: 'COP'
    },
    {
      slot_start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
      slot_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
      total_amount: 20000,
      currency: 'COP'
    }
  ];

  return {
    users,
    hostProfiles,
    spaces,
    inventorySlots,
    bookings
  };
}

async function seedDatabase() {
  console.log('Iniciando proceso de seed...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Obtener repositorios
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const hostProfileRepo = app.get<Repository<HostProfile>>(getRepositoryToken(HostProfile));
  const spaceRepo = app.get<Repository<Space>>(getRepositoryToken(Space));
  const inventorySlotRepo = app.get<Repository<InventorySlotEntity>>(getRepositoryToken(InventorySlotEntity));
  const bookingRepo = app.get<Repository<Booking>>(getRepositoryToken(Booking));

  try {
    // Generar datos
    const seedData = await generateSeedData();

    // Crear usuarios 
    console.log('👥 Creando usuarios...');
    const existingUsers = await userRepo.find();
    const existingEmails = existingUsers.map(u => u.email).filter(Boolean);
    const newUsers = seedData.users.filter(user => user.email && !existingEmails.includes(user.email));
    
    let createdUsers = existingUsers;
    if (newUsers.length > 0) {
      const newlyCreatedUsers = await userRepo.save(newUsers);
      createdUsers = [...existingUsers, ...newlyCreatedUsers];
      console.log(`${newlyCreatedUsers.length} nuevos usuarios creados (${existingUsers.length} ya existían)`);
    } else {
      console.log(`No se crearon usuarios nuevos (${existingUsers.length} ya existían)`);
    }

    // Crear host profiles 
    console.log('Creando host profiles...');
    const existingHostProfiles = await hostProfileRepo.find({ relations: ['user'] });
    const existingHostUserIds = existingHostProfiles.map(hp => hp.user.id);
    const hostUsers = createdUsers.filter(user => user.role === UserRole.HOST);
    const newHostUsers = hostUsers.filter(user => !existingHostUserIds.includes(user.id));
    
    let createdHostProfiles = existingHostProfiles;
    if (newHostUsers.length > 0) {
      const hostProfilesWithUsers = seedData.hostProfiles.slice(0, newHostUsers.length).map((profile, index) => ({
        ...profile,
        user: newHostUsers[index]
      }));
      const newlyCreatedHostProfiles = await hostProfileRepo.save(hostProfilesWithUsers);
      createdHostProfiles = [...existingHostProfiles, ...newlyCreatedHostProfiles];
      console.log(`${newlyCreatedHostProfiles.length} nuevos host profiles creados (${existingHostProfiles.length} ya existían)`);
    } else {
      console.log(`No se crearon host profiles nuevos (${existingHostProfiles.length} ya existían)`);
    }

    // Crear espacios 
    console.log('🏢 Creando espacios...');
    const existingSpaces = await spaceRepo.find({ relations: ['hostProfile'] });
    const existingSpaceTitles = existingSpaces.map(s => s.title).filter(Boolean);
    const newSpaces = seedData.spaces.filter(space => space.title && !existingSpaceTitles.includes(space.title));
    
    let createdSpaces = existingSpaces;
    if (newSpaces.length > 0) {
      const spacesWithHosts = newSpaces.map((space, index) => ({
        ...space,
        hostProfile: createdHostProfiles[index % createdHostProfiles.length]
      }));
      const newlyCreatedSpaces = await spaceRepo.save(spacesWithHosts);
      createdSpaces = [...existingSpaces, ...newlyCreatedSpaces];
      console.log(`${newlyCreatedSpaces.length} nuevos espacios creados (${existingSpaces.length} ya existían)`);
    } else {
      console.log(`No se crearon espacios nuevos (${existingSpaces.length} ya existían)`);
    }

    // Crear slots de inventario 
    console.log('Creando slots de inventario...');
    const existingSlots = await inventorySlotRepo.count();
    
    if (existingSlots === 0) {
      const slotsWithSpaces: any[] = [];
      let spaceIndex = 0;
      
      for (const slot of seedData.inventorySlots) {
        slotsWithSpaces.push({
          ...slot,
          space: createdSpaces[spaceIndex % createdSpaces.length]
        });
        spaceIndex++;
      }
      
      const createdSlots = await inventorySlotRepo.save(slotsWithSpaces);
      console.log(`${createdSlots.length} slots de inventario creados`);
    } else {
      console.log(`${existingSlots} slots de inventario ya existían`);
    }
    
    const createdSlots = await inventorySlotRepo.find({ relations: ['space'] });

    // Crear reservas 
    console.log('Creando reservas...');
    const existingBookings = await bookingRepo.count();
    
    if (existingBookings === 0) {
      const studentUsers = createdUsers.filter(user => user.role === UserRole.STUDENT);
      const openSlots = createdSlots.filter((slot: any) => slot.status === SlotStatus.BOOKED);
      
      const bookingsWithRelations = seedData.bookings.map((booking, index) => ({
        ...booking,
        user: studentUsers[index % studentUsers.length],
        space: (openSlots[index % openSlots.length] as any)?.space || createdSpaces[0]
      }));
      
      const createdBookings = await bookingRepo.save(bookingsWithRelations);
      console.log(`✅ ${createdBookings.length} reservas creadas`);
    } else {
      console.log(`✅ ${existingBookings} reservas ya existían`);
    }

    console.log('¡Seed completado exitosamente!\n');
    console.log(`- ${createdUsers.length} usuarios`);
    console.log(`- ${createdHostProfiles.length} host profiles`);
    console.log(`- ${createdSpaces.length} espacios`);
    console.log(`- ${createdSlots.length} slots de inventario`);
    
    const finalBookingCount = await bookingRepo.count();
    console.log(`- ${finalBookingCount} reservas`);

  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
