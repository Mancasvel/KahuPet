import { MongoClient, MongoClientOptions } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"

const options: MongoClientOptions = {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar variable global para preservar conexión entre reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // En producción, crear nueva conexión
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Obtiene el cliente MongoDB con reconexión automática
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    const client = await clientPromise
    // Verificar que la conexión esté activa
    await client.db('admin').admin().ping()
    return client
  } catch (error) {
    console.error('MongoDB connection error, attempting to reconnect:', error)
    // Recrear conexión si falló
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
    return await clientPromise
  }
}

/**
 * Obtiene la base de datos Pawsitive con reconexión automática
 */
export async function getPawsitiveDB() {
  const client = await getMongoClient()
  return client.db('Pawsitive')
}

/**
 * Ejecuta una operación con manejo automático de errores de conexión
 */
export async function withPawsitiveDB<T>(
  operation: (db: any) => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < retries; i++) {
    try {
      const db = await getPawsitiveDB()
      return await operation(db)
    } catch (error: any) {
      lastError = error
      console.error(`Database operation failed (attempt ${i + 1}/${retries}):`, error)
      
      // Si es un error de conexión, esperar antes del retry
      if (error.name?.includes('Mongo') || error.message?.includes('topology')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        // Forzar reconexión
        client = new MongoClient(uri, options)
        clientPromise = client.connect()
      } else {
        // Si no es error de conexión, no reintentar
        throw error
      }
    }
  }

  throw lastError!
}

export default clientPromise 