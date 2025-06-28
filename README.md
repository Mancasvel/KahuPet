# 🐾 Pawsitive - Bienestar personalizado para tu mascota

Pawsitive es una aplicación web revolucionaria que permite a los dueños de mascotas describir en lenguaje natural las necesidades de sus compañeros peludos y recibir recomendaciones personalizadas de entrenamiento, nutrición y bienestar.

## ✨ Características

- **Comunicación en lenguaje natural**: Describe lo que necesita tu mascota en tus propias palabras
- **IA integrada**: Utiliza OpenRouter para comprender las necesidades específicas de cada mascota
- **Respuestas personalizadas**: Tras el registro, la app responde como si fuera tu propia mascota
- **Interfaz moderna**: Diseñada con HeroUI y Tailwind CSS para una experiencia cálida y atractiva
- **Base de datos especializada**: MongoDB con información específica para diferentes razas y necesidades
- **Recomendaciones inteligentes**: Por raza, edad, personalidad y necesidades específicas

## 🎯 Áreas de enfoque

### 🐾 Entrenamiento y Educación
- Técnicas de obediencia básica y avanzada
- Corrección de comportamientos problemáticos
- Socialización y adaptación
- Entrenamiento específico por raza

### 🥩 Nutrición Personalizada
- Recomendaciones dietarias según raza y edad
- Planes alimenticios para necesidades especiales
- Control de peso y salud digestiva
- Suplementos y vitaminas

### 🧘 Vida Saludable
- Rutinas de ejercicio adaptadas
- Actividades de estimulación mental
- Juegos interactivos y educativos
- Cuidado preventivo de salud

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 + TypeScript
- **Estilo**: Tailwind CSS + HeroUI
- **Base de datos**: MongoDB Atlas
- **IA**: OpenRouter (LLM para comprensión de lenguaje natural)
- **API**: Next.js API Routes

## 🚀 Instalación y configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawsitive?retryWrites=true&w=majority

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=Pawsitive
```

#### Obtener MongoDB URI:
1. Crea una cuenta en [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster gratuito
3. Obtén la cadena de conexión desde "Connect" > "Connect your application"

#### Obtener OpenRouter API Key:
1. Regístrate en [OpenRouter](https://openrouter.ai/)
2. Ve a "API Keys" en tu dashboard
3. Crea una nueva API key

### 3. Poblar la base de datos

Ejecuta el script de seeding para llenar MongoDB con datos de ejemplo de mascotas:

```bash
npm run seed
```

Esto creará:
- Perfiles de diferentes razas de mascotas
- Recomendaciones de entrenamiento, nutrición y actividades
- Índices optimizados para búsquedas

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🐕 Ejemplos de consultas

Prueba estas consultas para ver cómo funciona Pawsitive:

### Entrenamiento:
- "Mi golden retriever de 2 años no deja de ladrar cuando llegan visitas"
- "¿Cómo enseño a mi cachorro a hacer sus necesidades fuera?"
- "Mi gato no usa la caja de arena, ¿qué puedo hacer?"

### Nutrición:
- "Mi perro senior necesita perder peso pero le encanta comer"
- "¿Qué comida es mejor para un bulldog francés con alergias?"
- "Mi gatito de 3 meses, ¿cuánto debe comer al día?"

### Bienestar:
- "Mi border collie se aburre mucho cuando no estoy"
- "Actividades para estimular mentalmente a mi pastor alemán"
- "Mi gato es muy sedentario, necesita más ejercicio"

## 🏗️ Estructura del proyecto

```
pawsitive/
├── app/
│   ├── layout.tsx          # Layout principal con HeroUI
│   ├── page.tsx            # Página principal con chat inteligente
│   ├── providers.tsx       # Configuración de HeroUI
│   ├── globals.css         # Estilos globales
│   └── api/
│       ├── pets/
│       │   └── route.ts    # API para gestión de mascotas
│       ├── recommendations/
│       │   └── route.ts    # API para recomendaciones
│       └── parse/
│           └── route.ts    # API para procesamiento de lenguaje natural
├── components/
│   ├── PetCard.tsx         # Componente para mostrar información de mascotas
│   ├── RecommendationCard.tsx # Componente para recomendaciones
│   └── PetVoiceChat.tsx    # Componente para respuestas como mascota
├── lib/
│   ├── openrouter.ts       # Comunicación con OpenRouter (adaptado para mascotas)
│   └── seed.ts             # Script de seeding con datos de mascotas
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔧 Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar build de producción
- `npm run lint` - Ejecutar linter
- `npm run seed` - Poblar base de datos con datos de mascotas

## 🎨 Personalización

### Agregar más razas y recomendaciones

Edita el archivo `lib/seed.ts` para agregar más datos:

```typescript
const samplePets = [
  {
    breed: "Golden Retriever",
    category: "Perro",
    characteristics: {
      size: "Grande",
      energy: "Alta",
      temperament: ["Amigable", "Inteligente", "Devoto"]
    },
    recommendations: [
      {
        type: "training",
        title: "Entrenamiento básico de obediencia",
        description: "Perfecto para golden retrievers jóvenes",
        tags: ["obediencia", "cachorro", "básico"]
      }
    ]
  }
]
```

### Modificar la personalidad de las respuestas

Edita `lib/openrouter.ts` para cambiar cómo responde como mascota:

```typescript
const petVoicePrompt = `Responde como si fueras la mascota del usuario...`
```

## 🐛 Solución de problemas

### Error de conexión a MongoDB
- Verifica que tu IP esté en la whitelist de MongoDB Atlas
- Asegúrate de que la cadena de conexión sea correcta
- Comprueba que el usuario tenga permisos de lectura/escritura

### Error de OpenRouter API
- Verifica que la API key sea válida
- Asegúrate de que tengas créditos en tu cuenta
- Comprueba que el modelo esté disponible

## 📝 Próximas características

- [ ] Registro y perfil de mascotas
- [ ] Historial de consultas y progreso
- [ ] Recordatorios de cuidados y actividades
- [ ] Integración con veterinarios
- [ ] Comunidad de dueños de mascotas
- [ ] Fotos y videos de actividades
- [ ] Seguimiento de salud y bienestar

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 💝 Con amor para nuestras mascotas

Pawsitive está dedicado a mejorar la vida de nuestros compañeros peludos, emplumados y escamosos. Porque ellos nos dan amor incondicional, merecen el mejor cuidado posible.

---

*"La grandeza de una nación puede ser juzgada por la forma en que trata a sus animales."* - Mahatma Gandhi 