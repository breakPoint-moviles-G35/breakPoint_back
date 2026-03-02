# Script de Seed para Base de Datos

Este directorio contiene scripts para poblar la base de datos con datos de prueba.

## ¿Qué hace el script de seed?

El script `seed.ts` genera datos de prueba para todas las entidades principales del sistema:

### 👥 Usuarios
- **1 Admin**: juan.admin@uniandes.edu.co
- **3 Hosts**: maria.host@uniandes.edu.co, carlos.host@uniandes.edu.co, ana.host@uniandes.edu.co
- **4 Students**: luis.student@uniandes.edu.co, sofia.student@uniandes.edu.co, diego.student@uniandes.edu.co, valentina.student@uniandes.edu.co

**Contraseñas por defecto:**
- Admin: `admin123`
- Hosts: `host123`
- Students: `student123`

### Host Profiles
- 3 perfiles de host con diferentes estados de verificación y métodos de pago

### Espacios
- **7 espacios diferentes** ubicados en varios edificios de Uniandes:
  - Sala de Estudio Silenciosa (ML)
  - Sala de Reuniones Grupales (SD)
  - Área de Coworking (W)
  - Sala de Proyectos (I)
  - Espacio de Lectura (Biblioteca)

### Slots de Inventario
- **60 slots** generados para los próximos 30 días
- Slots de 2 horas desde las 8 AM hasta las 8 PM
- Estados variados: OPEN, BOOKED, HOLD, BLOCKED
- Precios dinámicos basados en el espacio

### Reservas
- **3 reservas de ejemplo** con diferentes estados y usuarios

## Cómo ejecutar el seed

### Opción 1: Usando npm script (Recomendado)
```bash
npm run seed
```

### Opción 2: Usando npm run seed:dev
```bash
npm run seed:dev
```

### Opción 3: Ejecutar directamente con ts-node
```bash
npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
```


### Crear bookings
```
# 1. Compilar el proyecto
npm run build

# 2. Ejecutar la función
node dist/database/seeds/seed.js bookings
```

## ⚠️ Importante

**El script BORRA todos los datos existentes** antes de insertar los nuevos datos. Esto es útil para desarrollo pero **NUNCA** debe ejecutarse en producción.

Si quieres preservar datos existentes, puedes:
1. Hacer backup de la base de datos antes de ejecutar
2. Modificar el script para comentar las líneas de limpieza
3. Usar un script diferente que solo inserte sin borrar

## Estructura de datos generados

```
Usuarios (17)
├── 1 Admin
├── 3 Hosts
└── 4 Students

Host Profiles (3)
└── Vinculados a usuarios Host

Espacios (7)
├── Sala de Estudio Silenciosa - ML
├── Sala de Reuniones Grupales - SD
├── Área de Coworking - W
├── Sala de Proyectos - I
└── Espacio de Lectura - Biblioteca

Slots de Inventario (60)
├── 2 días
├── 6 slots por día (8AM-8PM, cada 2 horas)
└── 5 espacios = 30 × 6 × 5 = 60 slots

Reservas (3)
└── Con diferentes estados y usuarios
```

## Personalización

Puedes modificar el archivo `seed.ts` para:
- Cambiar la cantidad de usuarios, espacios o slots
- Modificar los datos de ejemplo
- Ajustar fechas y horarios
- Cambiar precios y características
- Agregar más tipos de espacios o amenities

## Troubleshooting

### Error de conexión a base de datos
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que la base de datos esté ejecutándose

### Error de permisos
- Verifica que el usuario de la base de datos tenga permisos de escritura
- En desarrollo, asegúrate de que `synchronize: true` esté habilitado

### Error de dependencias
- Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
