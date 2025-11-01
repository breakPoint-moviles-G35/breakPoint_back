import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../../user/entities/user/user.entity';
import { HostProfile } from '../../host-profile/entities/host-profile.entity/host-profile.entity';
import { Space } from '../../space/entities/space.entity/space.entity';
import { InventorySlotEntity, SlotStatus } from '../../inventory-slot/entities/inventory-slot.entity/inventory-slot.entity';
import { Booking, BookingStatus } from '../../booking/entities/booking.entity/booking.entity';

import { EventLog } from '../../event-log/entities/event-log.entity/event-log.entity';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Review } from 'src/review/entities/review.entity/review.entity';



interface SeedData {
  users: Partial<User>[];
  hostProfiles: Partial<HostProfile>[];
  spaces: Partial<Space>[];
  inventorySlots: Partial<InventorySlotEntity>[];
  bookings: Partial<Booking>[];
}

// Helpers
function pickOne<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMany<T>(arr: T[], k: number) {
  const a = [...arr]; const out: T[] = [];
  for (let i = 0; i < k && a.length; i++) out.push(a.splice(Math.floor(Math.random()*a.length), 1)[0]);
  return out;
}
function randomInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }

const FILTERS = ['silence','price','proximity','wifi','cleanliness'];
const FEATURES = ['extend_booking','share_link','reviews','chat_with_host'];

type Daypart = 'morning'|'midday'|'afternoon'|'night';
function randomDateInDaypart(base: Date, daypart: Daypart) {
  const d = new Date(base);
  const hourMap: Record<Daypart,[number,number]> = {
    morning: [6,11], midday: [12,13], afternoon:[14,18], night:[19,23]
  };
  const [h1,h2] = hourMap[daypart];
  d.setHours(randomInt(h1,h2), randomInt(0,59), randomInt(0,59), 0);
  return d;
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
  const reviewRepo = app.get<Repository<Review>>(getRepositoryToken(Review));
  const eventLogRepo = app.get<Repository<EventLog>>(getRepositoryToken(EventLog));

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
    console.log('Creando espacios...');
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
      console.log(`${createdBookings.length} reservas creadas`);
    } else {
      console.log(`${existingBookings} reservas ya existían`);
    }



    


    // ====== DATOS PARA Q3/Q4/Q7/Q13 ======
    console.log('Generando event_log (búsquedas, features, cancelaciones) y reviews/surveys...');

    const studentUsers = createdUsers.filter(u => u.role === UserRole.STUDENT);
    const now = new Date();

    // --- Q13: perfiles + satisfacción (survey/profile) ---
    const majors = ['Matemáticas','Ingeniería de Sistemas','Economía','Derecho','Diseño','Química','Administración'];
    const makeProfileEvent = (userId: string) => ({
      event_type: 'profile_updated',
      timestamp: new Date(),
      userId,
      payload: JSON.stringify({
        profile: {
          major: pickOne(majors),
          semester: randomInt(1, 10),
          age: randomInt(17, 30)
        }
      })
    });

    const makeSurveyEvent = (userId: string) => ({
      event_type: 'survey_submitted',
      timestamp: new Date(),
      userId,
      payload: JSON.stringify({
        satisfaction: Number((Math.random()*2 + 3).toFixed(1)), // 3.0 - 5.0
      })
    });

    // --- Q3: búsquedas con filtros (payload.filters = [...]) ---
    const makeSearchEvent = (userId: string) => {
      // 1 a 3 filtros por búsqueda, normalizando 'wifi'
      let k = randomInt(1,3);
      const chosen = pickMany(FILTERS, k);
      return {
        event_type: 'search',
        timestamp: new Date(now.getTime() - randomInt(0, 14)*24*3600*1000), // últimas 2 semanas
        userId,
        payload: JSON.stringify({ filters: chosen })
      };
    };

    // --- Q7: uso de funciones (extend, share link, reviews, chat) ---
    const makeFeatureEvent = (userId: string, bookingId: string) => {
      const et = pickOne(FEATURES);
      return {
        event_type: et, // 'extend_booking' | 'share_link' | 'reviews' | 'chat_with_host'
        timestamp: new Date(now.getTime() - randomInt(0, 14)*24*3600*1000),
        userId,
        bookingId,
        payload: JSON.stringify({ action: et.replace('_',' ') })
      };
    };

    // --- Q4: cancelaciones distribuidas por franja ---
    const dayparts: Daypart[] = ['morning','midday','afternoon','night'];
    const makeCancelEvent = (userId: string, bookingId: string, daypart: Daypart) => ({
      event_type: 'booking_canceled',
      timestamp: randomDateInDaypart(new Date(), daypart),
      userId,
      bookingId,
      payload: JSON.stringify({ reason: pickOne(['change_of_plans','found_other_space','too_expensive','illness']) })
    });

    // 1) Crea / actualiza perfiles y encuestas para todos los estudiantes
    const profileAndSurveys: any[] = [];
    for (const u of studentUsers) {
      profileAndSurveys.push(makeProfileEvent(u.id));
      // 1-2 encuestas por usuario
      const nSurveys = randomInt(1,2);
      for (let k=0;k<nSurveys;k++) profileAndSurveys.push(makeSurveyEvent(u.id));
    }
    try {
      await eventLogRepo.save(profileAndSurveys);
    } catch (error) {
      console.log('No se pudieron crear event logs de perfiles:', error.message);
    }

    // 2) Búsquedas con filtros (Q3): 3–8 por estudiante
    const searches: any[] = [];
    for (const u of studentUsers) {
      const n = randomInt(3, 8);
      for (let i = 0; i < n; i++) searches.push(makeSearchEvent(u.id));
    }
    try {
      await eventLogRepo.save(searches);
    } catch (error) {
      console.log('No se pudieron crear event logs de búsquedas:', error.message);
    }

    // 3) Uso de funciones (Q7): 1–4 por reserva, amarradas a bookings
    const allBookings = await bookingRepo.find({ relations: ['user'] });
    const featureEvents: any[] = [];
    for (const bk of allBookings) {
      const m = randomInt(1,4);
      for (let i=0;i<m;i++) featureEvents.push(makeFeatureEvent(bk.user.id, bk.id));
    }
    try {
      await eventLogRepo.save(featureEvents);
    } catch (error) {
      console.log('No se pudieron crear event logs de funciones:', error.message);
    }

    // 4) Cancelaciones (Q4): marca ~25% de bookings como canceladas y genera evento en franja
    const toCancel = allBookings.filter((_b, idx) => idx % 4 === 0); // ~25%
    for (const b of toCancel) {
      // Actualiza status a CANCELED (si existe en tu enum)
      try {
        await bookingRepo.update(b.id, { status: BookingStatus.CANCELLED });
      } catch (_) {
        // Si enum no tiene CANCELED, usa string
        await bookingRepo.update(b.id, { status: 'canceled' as any });
      }
    }
    const cancelEvents: any[] = [];
    for (const b of toCancel) {
      cancelEvents.push(makeCancelEvent(b.user.id, b.id, pickOne(dayparts)));
    }
    try {
      await eventLogRepo.save(cancelEvents);
    } catch (error) {
      console.log('No se pudieron crear event logs de cancelaciones:', error.message);
    }

    // 5) Reviews (para proxy de satisfacción y consistencia con Q7 'reviews')
    const reviews: any[] = [];
    for (const b of allBookings) {
      if (Math.random() < 0.6) { // ~60% de las reservas tienen review
        reviews.push({
          rating: randomInt(3,5),
          text: pickOne([
            'Muy buen espacio, tranquilo.',
            'Buena conexión WiFi y cómodo.',
            'Ruido en horas pico.',
            'Excelente para estudiar en grupo.',
            'Precio justo.'
          ]),
          flags: 0,
          createdAt: new Date(now.getTime() - randomInt(0, 10)*24*3600*1000),
          bookingId: b.id
        });
      }
    }
    if (reviews.length) {
      try {
        await reviewRepo.save(reviews);
      } catch (error) {
        console.log('No se pudieron crear reviews:', error.message);
      }
    }

    console.log(`Generados: ${profileAndSurveys.length} perfiles/encuestas, ${searches.length} búsquedas con filtros, ${featureEvents.length} eventos de funciones, ${cancelEvents.length} cancelaciones y ${reviews.length} reviews.`);

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

// Función para mostrar todos los bookings por consola y crear 3 nuevos bookings CONFIRMED
async function getAllBookings() {
  console.log('🔍 Obteniendo todos los bookings...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingRepo = app.get<Repository<Booking>>(getRepositoryToken(Booking));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const spaceRepo = app.get<Repository<Space>>(getRepositoryToken(Space));
  
  try {
    // Obtener bookings existentes
    const existingBookings = await bookingRepo.find({
      relations: ['user', 'space', 'space.hostProfile', 'space.hostProfile.user', 'review', 'accessCredential']
    });
    
    console.log(`\n📋 Total de bookings existentes: ${existingBookings.length}`);
    
    // Crear 3 nuevos bookings CONFIRMED
    console.log('\n🆕 Creando 3 nuevos bookings CONFIRMED...');
    
    // Obtener usuarios estudiantes para las nuevas reservas
    const studentUsers = await userRepo.find({ 
      where: { role: UserRole.STUDENT },
      take: 5 
    });
    
    // Obtener espacios disponibles
    const availableSpaces = await spaceRepo.find({ 
      relations: ['hostProfile', 'hostProfile.user'],
      take: 5 
    });
    
    if (studentUsers.length === 0 || availableSpaces.length === 0) {
      console.log('❌ No hay usuarios estudiantes o espacios disponibles para crear bookings');
      return;
    }
    
    // Generar fechas para los próximos 7 días
    const baseDate = new Date();
    const newBookings: Partial<Booking>[] = [];
    
    for (let i = 0; i < 1; i++) {
      const userIndex = i % studentUsers.length;
      const spaceIndex = i % availableSpaces.length;
      
      // Fecha de inicio: mañana + i días, entre 9 AM y 5 PM
      const startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() + 20 + i);
      startDate.setHours(9 + (i * 2), 0, 0, 0); // 9 AM, 11 AM, 1 PM
      
      // Fecha de fin: 2 horas después
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2);
      
      // Precio basado en el espacio + variación
      const basePrice = availableSpaces[spaceIndex].price || 15000;
      const price = basePrice + Math.floor(Math.random() * 5000);
      
      const newBooking: Partial<Booking> = {
        user: studentUsers[userIndex],
        space: availableSpaces[spaceIndex],
        slot_start: startDate,
        slot_end: endDate,
        status: BookingStatus.CONFIRMED,
        total_amount: price,
        currency: 'COP'
      };
      
      newBookings.push(newBooking);
    }
    
    // Guardar los nuevos bookings
    const createdBookings = await bookingRepo.save(newBookings);
    console.log(`✅ ${createdBookings.length} nuevos bookings CONFIRMED creados exitosamente`);
    
    // Obtener todos los bookings (existentes + nuevos)
    const allBookings = await bookingRepo.find({
      relations: ['user', 'space', 'space.hostProfile', 'space.hostProfile.user', 'review', 'accessCredential']
    });
    
    console.log(`\n📋 Total de bookings en la base de datos: ${allBookings.length}\n`);
    
    if (allBookings.length === 0) {
      console.log('❌ No hay bookings en la base de datos.');
      return;
    }
    
    allBookings.forEach((booking, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📝 BOOKING #${index + 1}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`🆔 ID: ${booking.id}`);
      console.log(`👤 Usuario: ${booking.user?.name || 'N/A'} (${booking.user?.email || 'N/A'})`);
      console.log(`🏢 Espacio: ${booking.space?.title || 'N/A'}`);
      console.log(`📍 Ubicación: ${booking.space?.geo || 'N/A'}`);
      console.log(`🏠 Host: ${booking.space?.hostProfile?.user?.name || 'N/A'}`);
      console.log(`📅 Inicio: ${booking.slot_start ? new Date(booking.slot_start).toLocaleString('es-CO') : 'N/A'}`);
      console.log(`📅 Fin: ${booking.slot_end ? new Date(booking.slot_end).toLocaleString('es-CO') : 'N/A'}`);
      console.log(`💰 Monto: $${booking.total_amount || 0} ${booking.currency || 'COP'}`);
      console.log(`📊 Estado: ${booking.status || 'N/A'}`);
      
      if (booking.review) {
        console.log(`⭐ Review: ${booking.review.rating}/5 - ${booking.review.text || 'Sin comentario'}`);
      } else {
        console.log(`⭐ Review: No disponible`);
      }
      
      if (booking.accessCredential) {
        console.log(`🔐 Credencial de acceso: Disponible`);
      } else {
        console.log(`🔐 Credencial de acceso: No disponible`);
      }
      
      console.log(`📈 Incidentes: ${booking.incidents?.length || 0}`);
    });
    
    // Estadísticas adicionales
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 ESTADÍSTICAS`);
    console.log(`${'='.repeat(80)}`);
    
    const statusCounts = allBookings.reduce((acc, booking) => {
      const status = booking.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Distribución por estado:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    const totalAmount = allBookings.reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0);
    console.log(`\n💰 Monto total de todos los bookings: $${totalAmount} COP`);
    
    const avgAmount = allBookings.length > 0 ? totalAmount / allBookings.length : 0;
    console.log(`💰 Monto promedio por booking: $${Math.round(avgAmount)} COP`);
    
    const withReviews = allBookings.filter(b => b.review).length;
    console.log(`\n⭐ Bookings con reviews: ${withReviews}/${allBookings.length} (${Math.round((withReviews/allBookings.length)*100)}%)`);
    
  } catch (error) {
    console.error('❌ Error al obtener/crear los bookings:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar getAllBookings si se llama directamente
if (require.main === module) {
  // Si se pasa el argumento 'bookings', ejecutar getAllBookings
  if (process.argv.includes('bookings')) {
    getAllBookings().catch(console.error);
  } else {
    // Por defecto ejecutar el seed
    seedDatabase().catch(console.error);
  }
}

// Función para inspeccionar los datos de event_log
async function inspectEventLog() {
  console.log('🔍 Inspeccionando datos de event_log...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventLogRepo = app.get<Repository<EventLog>>(getRepositoryToken(EventLog));
  
  try {
    // Obtener todos los eventos
    const allEvents = await eventLogRepo.find({
      relations: ['user']
    });
    
    console.log(`\n📋 Total de eventos en event_log: ${allEvents.length}\n`);
    
    if (allEvents.length === 0) {
      console.log('❌ No hay eventos en la base de datos.');
      return;
    }
    
    // Agrupar por event_type
    const eventsByType = allEvents.reduce((acc, event) => {
      const type = event.event_type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(event);
      return acc;
    }, {} as Record<string, EventLog[]>);
    
    console.log('📊 Eventos por tipo:');
    Object.entries(eventsByType).forEach(([type, events]) => {
      console.log(`   ${type}: ${events.length} eventos`);
    });
    
    // Inspeccionar eventos de búsqueda específicamente
    const searchEvents = eventsByType['search'] || [];
    console.log(`\n🔍 Analizando ${searchEvents.length} eventos de búsqueda...\n`);
    
    if (searchEvents.length > 0) {
      console.log('📋 Ejemplos de eventos de búsqueda:');
      searchEvents.slice(0, 5).forEach((event, index) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 EVENTO #${index + 1}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`🆔 ID: ${event.id}`);
        console.log(`👤 Usuario: ${event.user?.name || 'N/A'} (${event.user?.email || 'N/A'})`);
        console.log(`📅 Timestamp: ${event.timestamp ? new Date(event.timestamp).toLocaleString('es-CO') : 'N/A'}`);
        console.log(`📊 Event Type: ${event.event_type}`);
        console.log(`📄 Payload: ${event.payload}`);
        
        // Intentar parsear el payload
        try {
          const parsedPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          console.log(`📄 Payload (parsed): ${JSON.stringify(parsedPayload, null, 2)}`);
          
          if (parsedPayload.filters) {
            console.log(`🔍 Filtros encontrados: ${JSON.stringify(parsedPayload.filters)}`);
          }
        } catch (error) {
          console.log(`❌ Error parsing payload: ${error.message}`);
        }
      });
      
      // Analizar filtros
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔍 ANÁLISIS DE FILTROS`);
      console.log(`${'='.repeat(80)}`);
      
      const allFilters: string[] = [];
      searchEvents.forEach(event => {
        try {
          const parsedPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          if (parsedPayload.filters && Array.isArray(parsedPayload.filters)) {
            allFilters.push(...parsedPayload.filters);
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      });
      
      console.log(`📊 Total de filtros encontrados: ${allFilters.length}`);
      
      // Contar filtros únicos
      const filterCounts = allFilters.reduce((acc, filter) => {
        acc[filter] = (acc[filter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n📊 Distribución de filtros:');
      Object.entries(filterCounts).forEach(([filter, count]) => {
        console.log(`   ${filter}: ${count} veces`);
      });
      
      // Verificar filtros esperados
      const expectedFilters = ['silence', 'price', 'proximity', 'wifi', 'cleanliness'];
      console.log('\n✅ Filtros esperados vs encontrados:');
      expectedFilters.forEach(filter => {
        const found = filterCounts[filter] || 0;
        console.log(`   ${filter}: ${found > 0 ? '✅' : '❌'} (${found})`);
      });
    }
    
    // Inspeccionar la estructura de la tabla
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 ESTRUCTURA DE DATOS`);
    console.log(`${'='.repeat(80)}`);
    
    const sampleEvent = allEvents[0];
    console.log('📋 Campos disponibles en event_log:');
    console.log(`   - id: ${sampleEvent.id}`);
    console.log(`   - event_type: ${sampleEvent.event_type}`);
    console.log(`   - timestamp: ${sampleEvent.timestamp}`);
    console.log(`   - payload: ${typeof sampleEvent.payload} - ${JSON.stringify(sampleEvent.payload)}`);
    console.log(`   - user: ${sampleEvent.user ? 'Relación cargada' : 'Relación no cargada'}`);
    console.log(`   - userId: ${(sampleEvent as any).userId || 'Campo no encontrado'}`);
    
  } catch (error) {
    console.error('❌ Error al inspeccionar event_log:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar getAllBookings si se llama directamente
if (require.main === module) {
  // Si se pasa el argumento 'bookings', ejecutar getAllBookings
  if (process.argv.includes('bookings')) {
    getAllBookings().catch(console.error);
  } else if (process.argv.includes('events')) {
    // Si se pasa el argumento 'events', ejecutar inspectEventLog
    inspectEventLog().catch(console.error);
  } else {
    // Por defecto ejecutar el seed
    seedDatabase().catch(console.error);
  }
}

// Función para consultar registros de event_log
async function getEventLogs() {
  console.log('🔍 Consultando registros de event_log...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventLogRepo = app.get<Repository<EventLog>>(getRepositoryToken(EventLog));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  
  try {
    // Obtener todos los eventos con relaciones
    const events = await eventLogRepo.find({
      relations: ['user', 'booking']
    });
    
    console.log(`\n📋 Total de eventos encontrados: ${events.length}\n`);
    
    if (events.length === 0) {
      console.log('❌ No hay eventos en la base de datos.');
      return;
    }
    
    // Agrupar por tipo de evento
    const eventsByType = events.reduce((acc, event) => {
      const type = event.event_type || 'UNKNOWN';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(event);
      return acc;
    }, {} as Record<string, EventLog[]>);
    
    console.log('📊 Eventos por tipo:');
    Object.entries(eventsByType).forEach(([type, events]) => {
      console.log(`   ${type}: ${events.length} eventos`);
    });
    
    // Mostrar detalles de los eventos
    events.forEach((event, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📝 EVENTO #${index + 1}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`🆔 ID: ${event.id}`);
      console.log(`👤 Usuario: ${event.user?.name || 'N/A'} (${event.user?.email || 'N/A'})`);
      console.log(`📊 Event Type: ${event.event_type}`);
      console.log(`📅 Timestamp: ${event.timestamp ? new Date(event.timestamp).toLocaleString('es-CO') : 'N/A'}`);
      console.log(`🔗 Booking ID: ${event.booking?.id || 'N/A'}`);
      
      // Mostrar payload parseado
      try {
        const parsedPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
        console.log(`📄 Payload: ${JSON.stringify(parsedPayload, null, 2)}`);
        
        // Mostrar filtros si es un evento de búsqueda
        if (event.event_type === 'search' && parsedPayload.filters) {
          console.log(`🔍 Filtros: ${JSON.stringify(parsedPayload.filters)}`);
        }
        
        // Mostrar acción si es un evento de función
        if (['extend_booking', 'share_link', 'reviews', 'chat_with_host'].includes(event.event_type) && parsedPayload.action) {
          console.log(`⚡ Acción: ${parsedPayload.action}`);
        }
        
        // Mostrar razón si es una cancelación
        if (event.event_type === 'booking_canceled' && parsedPayload.reason) {
          console.log(`❌ Razón: ${parsedPayload.reason}`);
        }
        
        // Mostrar perfil si es actualización de perfil
        if (event.event_type === 'profile_updated' && parsedPayload.profile) {
          console.log(`👤 Perfil: ${JSON.stringify(parsedPayload.profile)}`);
        }
        
        // Mostrar satisfacción si es encuesta
        if (event.event_type === 'survey_submitted' && parsedPayload.satisfaction) {
          console.log(`⭐ Satisfacción: ${parsedPayload.satisfaction}/5`);
        }
        
      } catch (error) {
        console.log(`📄 Payload (raw): ${event.payload}`);
        console.log(`❌ Error parsing payload: ${error.message}`);
      }
    });
    
    // Estadísticas adicionales
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 ESTADÍSTICAS DETALLADAS`);
    console.log(`${'='.repeat(80)}`);
    
    // Contar eventos por tipo
    console.log('📊 Distribución por tipo de evento:');
    Object.entries(eventsByType).forEach(([type, events]) => {
      console.log(`   ${type}: ${events.length}`);
    });
    
    // Analizar eventos de búsqueda
    const searchEvents = eventsByType['search'] || [];
    if (searchEvents.length > 0) {
      console.log(`\n🔍 Análisis de eventos de búsqueda (${searchEvents.length}):`);
      
      const allFilters: string[] = [];
      searchEvents.forEach(event => {
        try {
          const parsedPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          if (parsedPayload.filters && Array.isArray(parsedPayload.filters)) {
            allFilters.push(...parsedPayload.filters);
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      });
      
      const filterCounts = allFilters.reduce((acc, filter) => {
        acc[filter] = (acc[filter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('   Filtros más usados:');
      Object.entries(filterCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([filter, count]) => {
          console.log(`     ${filter}: ${count} veces`);
        });
    }
    
    // Analizar eventos de funciones
    const featureEvents = events.filter(e => ['extend_booking', 'share_link', 'reviews', 'chat_with_host'].includes(e.event_type));
    if (featureEvents.length > 0) {
      console.log(`\n⚡ Análisis de eventos de funciones (${featureEvents.length}):`);
      
      const featureCounts = featureEvents.reduce((acc, event) => {
        const type = event.event_type || 'UNKNOWN';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(featureCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([feature, count]) => {
          console.log(`     ${feature}: ${count} veces`);
        });
    }
    
    // Analizar cancelaciones
    const cancelEvents = eventsByType['booking_canceled'] || [];
    if (cancelEvents.length > 0) {
      console.log(`\n❌ Análisis de cancelaciones (${cancelEvents.length}):`);
      
      const reasonCounts = cancelEvents.reduce((acc, event) => {
        try {
          const parsedPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          const reason = parsedPayload.reason || 'unknown';
          acc[reason] = (acc[reason] || 0) + 1;
        } catch (error) {
          acc['parse_error'] = (acc['parse_error'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(reasonCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([reason, count]) => {
          console.log(`     ${reason}: ${count} veces`);
        });
    }
    
    // Estadísticas de usuarios
    const uniqueUsers = new Set(events.map(e => e.user?.id).filter(Boolean));
    console.log(`\n👥 Usuarios únicos con eventos: ${uniqueUsers.size}`);
    
    // Estadísticas de fechas
    const dates = events.map(e => e.timestamp).filter(Boolean);
    if (dates.length > 0) {
      const sortedDates = dates.sort();
      const oldest = new Date(sortedDates[0]);
      const newest = new Date(sortedDates[sortedDates.length - 1]);
      console.log(`📅 Rango de fechas: ${oldest.toLocaleDateString('es-CO')} - ${newest.toLocaleDateString('es-CO')}`);
    }
    
  } catch (error) {
    console.error('❌ Error al consultar event_log:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar funciones según el argumento
if (require.main === module) {
  if (process.argv.includes('bookings')) {
    getAllBookings().catch(console.error);
  } else if (process.argv.includes('events')) {
    getEventLogs().catch(console.error);
  } else if (process.argv.includes('inspect')) {
    inspectEventLog().catch(console.error);
  } else {
    // Por defecto ejecutar el seed
    seedDatabase().catch(console.error);
  }
}

// Función para mostrar todas las tablas y sus columnas
async function showDatabaseSchema() {
  console.log('🗃️ Mostrando esquema de la base de datos...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    // Obtener todas las tablas
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`\n📋 Total de tablas encontradas: ${tables.length}\n`);
    
    if (tables.length === 0) {
      console.log('❌ No hay tablas en la base de datos.');
      return;
    }
    
    // Para cada tabla, obtener sus columnas
    for (const table of tables) {
      const tableName = table.table_name;
      
      const columns = await dataSource.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 TABLA: ${tableName.toUpperCase()}`);
      console.log(`${'='.repeat(80)}`);
      console.log(`📋 Columnas: ${columns.length}\n`);
      
      columns.forEach((column, index) => {
        const {
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        } = column;
        
        console.log(`${index + 1}. ${column_name}`);
        console.log(`   📝 Tipo: ${data_type}`);
        
        // Mostrar longitud si aplica
        if (character_maximum_length) {
          console.log(`   📏 Longitud: ${character_maximum_length}`);
        }
        
        // Mostrar precisión para números
        if (numeric_precision) {
          console.log(`   🔢 Precisión: ${numeric_precision}`);
          if (numeric_scale) {
            console.log(`   🔢 Escala: ${numeric_scale}`);
          }
        }
        
        // Mostrar nullable
        console.log(`   ❓ Nullable: ${is_nullable === 'YES' ? 'Sí' : 'No'}`);
        
        // Mostrar valor por defecto si existe
        if (column_default) {
          console.log(`   🔧 Default: ${column_default}`);
        }
        
        console.log('');
      });
      
      // Obtener información de índices
      const indexes = await dataSource.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1 
        AND schemaname = 'public';
      `, [tableName]);
      
      if (indexes.length > 0) {
        console.log(`🔗 Índices (${indexes.length}):`);
        indexes.forEach((index, idx) => {
          console.log(`   ${idx + 1}. ${index.indexname}`);
        });
        console.log('');
      }
      
      // Obtener información de foreign keys
      const foreignKeys = await dataSource.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
        AND tc.table_schema = 'public';
      `, [tableName]);
      
      if (foreignKeys.length > 0) {
        console.log(`🔗 Foreign Keys (${foreignKeys.length}):`);
        foreignKeys.forEach((fk, idx) => {
          console.log(`   ${idx + 1}. ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
        console.log('');
      }
    }
    
    // Resumen general
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 RESUMEN GENERAL`);
    console.log(`${'='.repeat(80)}`);
    
    console.log(`📋 Total de tablas: ${tables.length}`);
    
    // Contar columnas totales
    let totalColumns = 0;
    const tableSummary: { name: string; columns: number }[] = [];
    
    for (const table of tables) {
      const columns = await dataSource.query(`
        SELECT COUNT(*) as column_count
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public';
      `, [table.table_name]);
      
      const columnCount = parseInt(columns[0].column_count);
      totalColumns += columnCount;
      tableSummary.push({
        name: table.table_name,
        columns: columnCount
      });
    }
    
    console.log(`📋 Total de columnas: ${totalColumns}`);
    
    console.log('\n📊 Resumen por tabla:');
    tableSummary
      .sort((a, b) => b.columns - a.columns)
      .forEach(table => {
        console.log(`   ${table.name}: ${table.columns} columnas`);
      });
    
  } catch (error) {
    console.error('❌ Error al obtener esquema de la base de datos:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar funciones según el argumento
if (require.main === module) {
  if (process.argv.includes('bookings')) {
    getAllBookings().catch(console.error);
  } else if (process.argv.includes('events')) {
    getEventLogs().catch(console.error);
  } else if (process.argv.includes('inspect')) {
    inspectEventLog().catch(console.error);
  } else if (process.argv.includes('schema')) {
    showDatabaseSchema().catch(console.error);
  } else {
    // Por defecto ejecutar el seed
    seedDatabase().catch(console.error);
  }
}

// Función para crear eventos con relaciones correctas
async function createEventsWithRelations() {
  console.log('🔧 Creando eventos con relaciones correctas...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const eventLogRepo = app.get<Repository<EventLog>>(getRepositoryToken(EventLog));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const bookingRepo = app.get<Repository<Booking>>(getRepositoryToken(Booking));
  
  try {
    // Limpiar eventos existentes para evitar duplicados
    console.log('🧹 Limpiando eventos existentes...');
    await eventLogRepo.clear();
    
    // Obtener usuarios y bookings
    const users = await userRepo.find();
    const bookings = await bookingRepo.find({ relations: ['user'] });
    const studentUsers = users.filter(u => u.role === UserRole.STUDENT);
    
    console.log(`👥 Usuarios disponibles: ${users.length} (${studentUsers.length} estudiantes)`);
    console.log(`📋 Bookings disponibles: ${bookings.length}`);
    
    if (studentUsers.length === 0) {
      console.log('❌ No hay usuarios estudiantes para crear eventos');
      return;
    }
    
    // Fábricas de eventos con relaciones correctas
    const makeProfileEvent = (userId: string) => ({
      event_type: 'profile_updated',
      timestamp: new Date(),
      user: { id: userId } as any,
      payload: JSON.stringify({
        profile: {
          major: pickOne(['Matemáticas','Ingeniería de Sistemas','Economía','Derecho','Diseño','Química','Administración']),
          semester: randomInt(1, 10),
          age: randomInt(17, 30)
        }
      })
    });

    const makeSurveyEvent = (userId: string) => ({
      event_type: 'survey_submitted',
      timestamp: new Date(),
      user: { id: userId } as any,
      payload: JSON.stringify({
        satisfaction: Number((Math.random() * 2 + 3).toFixed(1)) // 3.0 - 5.0
      })
    });

    const makeSearchEvent = (userId: string) => ({
      event_type: 'search',
      timestamp: new Date(Date.now() - randomInt(0, 14) * 24 * 3600 * 1000), // últimas 2 semanas
      user: { id: userId } as any,
      payload: JSON.stringify({
        filters: pickMany(FILTERS, randomInt(1, 3))
      })
    });

    const makeFeatureEvent = (userId: string, bookingId: string) => ({
      event_type: pickOne(FEATURES),
      timestamp: new Date(Date.now() - randomInt(0, 14) * 24 * 3600 * 1000),
      user: { id: userId } as any,
      booking: { id: bookingId } as any,
      payload: JSON.stringify({
        action: pickOne(FEATURES).replace('_', ' ')
      })
    });

    const makeCancelEvent = (userId: string, bookingId: string, daypart: Daypart) => ({
      event_type: 'booking_canceled',
      timestamp: randomDateInDaypart(new Date(), daypart),
      user: { id: userId } as any,
      booking: { id: bookingId } as any,
      payload: JSON.stringify({
        reason: pickOne(['change_of_plans','found_other_space','too_expensive','illness'])
      })
    });

    const allEvents: any[] = [];
    
    // 1. Crear eventos de perfil y encuestas para todos los estudiantes
    console.log('👤 Creando eventos de perfil y encuestas...');
    for (const user of studentUsers) {
      allEvents.push(makeProfileEvent(user.id));
      
      // 1-2 encuestas por usuario
      const nSurveys = randomInt(1, 2);
      for (let k = 0; k < nSurveys; k++) {
        allEvents.push(makeSurveyEvent(user.id));
      }
    }
    
    // 2. Crear eventos de búsqueda (3-8 por estudiante)
    console.log('🔍 Creando eventos de búsqueda...');
    for (const user of studentUsers) {
      const n = randomInt(3, 8);
      for (let i = 0; i < n; i++) {
        allEvents.push(makeSearchEvent(user.id));
      }
    }
    
    // 3. Crear eventos de funciones (1-4 por booking)
    console.log('⚡ Creando eventos de funciones...');
    for (const booking of bookings) {
      const m = randomInt(1, 4);
      for (let i = 0; i < m; i++) {
        allEvents.push(makeFeatureEvent(booking.user.id, booking.id));
      }
    }
    
    // 4. Crear eventos de cancelación (25% de bookings)
    console.log('❌ Creando eventos de cancelación...');
    const dayparts: Daypart[] = ['morning','midday','afternoon','night'];
    const toCancel = bookings.filter((_, idx) => idx % 4 === 0); // ~25%
    
    for (const booking of toCancel) {
      allEvents.push(makeCancelEvent(booking.user.id, booking.id, pickOne(dayparts)));
    }
    
    // Guardar todos los eventos
    console.log(`💾 Guardando ${allEvents.length} eventos...`);
    const savedEvents = await eventLogRepo.save(allEvents);
    
    console.log(`✅ ${savedEvents.length} eventos creados exitosamente`);
    
    // Verificar que los eventos se guardaron correctamente
    const verificationEvents = await eventLogRepo.find({
      relations: ['user', 'booking'],
      take: 5
    });
    
    console.log('\n🔍 Verificación de eventos guardados:');
    verificationEvents.forEach((event, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📝 EVENTO #${index + 1}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`🆔 ID: ${event.id}`);
      console.log(`📊 Tipo: ${event.event_type}`);
      console.log(`👤 Usuario: ${event.user?.name || 'N/A'} (${event.user?.email || 'N/A'})`);
      console.log(`🔗 Booking: ${event.booking?.id || 'N/A'}`);
      console.log(`📅 Timestamp: ${event.timestamp.toLocaleString('es-CO')}`);
      
      try {
        const payload = JSON.parse(event.payload);
        console.log(`📄 Payload: ${JSON.stringify(payload, null, 2)}`);
      } catch (error) {
        console.log(`📄 Payload: ${event.payload}`);
      }
    });
    
    // Estadísticas finales
    const eventStats = await eventLogRepo.query(`
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT "userId") as unique_users
      FROM event_log 
      GROUP BY event_type 
      ORDER BY count DESC
    `);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 ESTADÍSTICAS FINALES`);
    console.log(`${'='.repeat(80)}`);
    
    eventStats.forEach(stat => {
      console.log(`   ${stat.event_type}: ${stat.count} eventos, ${stat.unique_users} usuarios únicos`);
    });
    
    const totalWithUsers = await eventLogRepo.count({ where: { user: { id: Not(IsNull()) } } });
    const totalEvents = await eventLogRepo.count();
    
    console.log(`\n📊 Eventos con usuario asignado: ${totalWithUsers}/${totalEvents} (${Math.round((totalWithUsers/totalEvents)*100)}%)`);
    
  } catch (error) {
    console.error('❌ Error al crear eventos:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar funciones según el argumento
if (require.main === module) {
  if (process.argv.includes('bookings')) {
    getAllBookings().catch(console.error);
  } else if (process.argv.includes('events')) {
    getEventLogs().catch(console.error);
  } else if (process.argv.includes('inspect')) {
    inspectEventLog().catch(console.error);
  } else if (process.argv.includes('schema')) {
    showDatabaseSchema().catch(console.error);
  } else if (process.argv.includes('fix-events')) {
    createEventsWithRelations().catch(console.error);
  } else {
    // Por defecto ejecutar el seed
    seedDatabase().catch(console.error);
  }
}

export { seedDatabase, getAllBookings, inspectEventLog, getEventLogs, showDatabaseSchema, createEventsWithRelations };
