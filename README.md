# 🍜 Komi - Encuentra tu plato perfecto

Komi es una aplicación web que permite a los usuarios describir en lenguaje natural lo que les apetece comer y recibe recomendaciones de platos reales disponibles en restaurantes registrados.

## ✨ Características

- **Búsqueda en lenguaje natural**: Describe lo que quieres comer en tus propias palabras
- **IA integrada**: Utiliza OpenRouter para extraer intenciones de las consultas
- **Interfaz moderna**: Diseñada con HeroUI y Tailwind CSS
- **Base de datos rica**: MongoDB con restaurantes y platos diversos
- **Filtros inteligentes**: Por ingredientes, restricciones dietarias y categorías

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 + TypeScript
- **Estilo**: Tailwind CSS + HeroUI
- **Base de datos**: MongoDB Atlas
- **IA**: OpenRouter (LLM gratuito)
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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/komi?retryWrites=true&w=majority

# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=Komi
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

Ejecuta el script de seeding para llenar MongoDB con datos de ejemplo:

```bash
npm run seed
```

Esto creará:
- 4 restaurantes con diferentes tipos de cocina
- 12 platos con variedad de ingredientes y etiquetas
- Índices optimizados para búsquedas

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🍽️ Datos de ejemplo

La aplicación incluye datos de ejemplo de 4 restaurantes:

1. **La Toscana** (Italiana) - Pasta vegana, risotto, pizza sin gluten
2. **El Rincón Español** (Española) - Paella, gazpacho, tortilla picante
3. **Sakura Sushi** (Japonesa) - Sushi vegano, ramen picante, teriyaki
4. **Green Garden** (Saludable) - Bowls, ensaladas veganas, hamburguesas de lentejas

## 💡 Ejemplos de búsquedas

Prueba estas consultas para ver cómo funciona la aplicación:

- "Quiero algo vegano con arroz, que sea rápido y sin picante"
- "Comida tradicional española con carne"
- "Plato sin gluten y económico"
- "Algo picante con pollo para llevar"
- "Comida italiana vegetariana"

## 🏗️ Estructura del proyecto

```
komi/
├── app/
│   ├── layout.tsx          # Layout principal con HeroUI
│   ├── page.tsx            # Página principal con interfaz de chat
│   ├── providers.tsx       # Configuración de HeroUI
│   ├── globals.css         # Estilos globales
│   └── api/
│       └── parse/
│           └── route.ts    # API route para procesar consultas
├── components/
│   ├── DishCard.tsx        # Componente para mostrar platos
│   └── SearchIcon.tsx      # Icono de búsqueda
├── lib/
│   ├── openrouter.ts       # Comunicación con OpenRouter
│   └── seed.ts             # Script de seeding
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
- `npm run seed` - Poblar base de datos

## 🎨 Personalización

### Agregar más restaurantes y platos

Edita el archivo `lib/seed.ts` para agregar más datos:

```typescript
const sampleRestaurants = [
  {
    name: "Tu Restaurante",
    address: "Tu Dirección",
    dishes: [
      {
        name: "Tu Plato",
        description: "Descripción del plato",
        ingredients: ["ingrediente1", "ingrediente2"],
        tags: ["tag1", "tag2"],
        price: 15.00,
        image: "URL_de_imagen"
      }
    ]
  }
]
```

### Modificar el prompt de IA

Edita `lib/openrouter.ts` para cambiar cómo la IA interpreta las consultas:

```typescript
const systemPrompt = `Tu prompt personalizado...`
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

### Errores de dependencias
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Próximas características

- [ ] Autenticación de usuarios
- [ ] Favoritos y historial
- [ ] Sistema de pedidos
- [ ] Más filtros de búsqueda
- [ ] Geolocalización
- [ ] Reseñas y calificaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [HeroUI](https://heroui.dev) por los componentes de interfaz
- [OpenRouter](https://openrouter.ai) por el acceso a modelos LLM
- [MongoDB Atlas](https://cloud.mongodb.com) por la base de datos
- [Unsplash](https://unsplash.com) por las imágenes de ejemplo

---

¡Hecho con ❤️ para encontrar el plato perfecto! 