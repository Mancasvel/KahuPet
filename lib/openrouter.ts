interface LLMResponse {
  petCharacteristics: string[]
  issues: string[]
  recommendationTypes: string[]
  specificRecommendations: string[]
  petVoiceResponse?: {
    hasRegisteredPet: boolean
    petName?: string
    petBreed?: string
    voiceMessage: string
    emotionalTone: string
  }
}

export async function callOpenRouter(userQuery: string, availableRecommendations?: any[], userPet?: any, conversationHistory?: any[]): Promise<LLMResponse | null> {
  try {
    // Construir contexto de recomendaciones disponibles si se proporciona
    let recommendationsContext = ""
    if (availableRecommendations && availableRecommendations.length > 0) {
      recommendationsContext = `

RECOMENDACIONES DISPONIBLES EN KAHUPET:
${availableRecommendations.map(rec => `
- ${rec.title} (${rec.breed || 'Genérico'} - ${rec.type})
  Dificultad: ${rec.difficulty}
  Duración: ${rec.duration}
  Edad recomendada: ${rec.ageRange}
  Tags: ${rec.tags?.join(', ') || 'No especificados'}
  Descripción: ${rec.description || 'Sin descripción'}
  ID: ${rec._id}
`).join('')}
`
    }

    // Construir contexto de la mascota del usuario si está disponible
    let userPetContext = ""
    if (userPet) {
      userPetContext = `

MASCOTA REGISTRADA DEL USUARIO:
- Nombre: ${userPet.nombre}
- Tipo: ${userPet.tipo}
- Raza: ${userPet.raza}
- Edad: ${userPet.edad || 'No especificada'} años
- Peso: ${userPet.peso || 'No especificado'} kg
- Género: ${userPet.genero || 'No especificado'}
- Notas: ${userPet.notas || 'Ninguna'}

IMPORTANTE: Como el usuario YA TIENE una mascota registrada, en la respuesta debes:
1. Establecer hasRegisteredPet: true 
2. Usar el nombre "${userPet.nombre}" como petName
3. Usar "${userPet.raza}" como petBreed
4. SIEMPRE generar un voiceMessage personalizado como si fueras ${userPet.nombre} (${userPet.raza}) hablando directamente a su humano
5. Hacer referencia específica a la información de la mascota cuando sea relevante (edad, raza, características)
6. USAR LOS DATOS ESPECÍFICOS: edad (${userPet.edad} años), peso (${userPet.peso} kg), género (${userPet.genero}), notas (${userPet.notas})
7. El voiceMessage debe ser EXTENDIDO (mínimo 3 párrafos) incluyendo información científica sobre la raza
8. Personalizar completamente basado en la información real de ${userPet.nombre}
`
    }

    // Construir contexto de historial de conversación
    let conversationContext = ''
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = `
HISTORIAL DE CONVERSACIÓN PREVIO:
${conversationHistory.map((msg, index) => {
  const role = msg.type === 'user' ? 'HUMANO' : (userPet ? userPet.nombre.toUpperCase() : 'ASISTENTE')
  return `${index + 1}. ${role}: ${msg.content}`
}).join('\n')}

CONTEXTO: Esta es una conversación continua. Mantén la coherencia con los mensajes anteriores y haz referencia a información previa cuando sea relevante. Si el usuario menciona algo que ya discutieron, reconócelo. Si hay un problema en curso, continúa trabajando en él.

INSTRUCCIONES PARA CONTINUIDAD:
- Si ya identificaste problemas específicos en mensajes anteriores, continúa trabajando en ellos
- Si el usuario hace preguntas de seguimiento, bástalas en el contexto previo
- Mantén la personalidad consistente de la mascota a lo largo de la conversación
- Si hay información contradictoria, pregunta para clarificar
- Haz referencia a soluciones o consejos previos cuando sea apropiado

`
    }

    const systemPrompt = `Eres el asistente IA de Kahupet, una aplicación especializada que entiende a tu mascota y ayuda con entrenamiento, nutrición y vida saludable.

${conversationContext}

Tu trabajo es:
1. Analizar consultas sobre mascotas para entender ESPECÍFICAMENTE qué necesitan
2. Extraer criterios de búsqueda MUY PRECISOS para filtrar recomendaciones relevantes
3. Detectar si el usuario ya tiene una mascota registrada para responder como la mascota
4. SER EXTREMADAMENTE ESPECÍFICO en la categorización

ÁREAS DE ESPECIALIZACIÓN:
🐾 ENTRENAMIENTO (training): Obediencia, socialización, corrección de comportamientos, trucos, comandos
🥩 NUTRICIÓN (nutrition): Alimentación por raza/edad, control de peso, alergias, suplementos, comida
🧘 BIENESTAR (wellness): Ejercicio, estimulación mental, cuidado del pelaje, salud preventiva, higiene

REGLAS CRÍTICAS PARA EXTRAER CRITERIOS:
1. **petCharacteristics**: Debe incluir EXACTAMENTE el tipo de animal ("perro" o "gato") y la raza específica si se menciona
2. **issues**: Debe ser MUY ESPECÍFICO sobre el problema (ej: "ladridos excesivos", "sobrepeso", "ansiedad por separación")
3. **recommendationTypes**: Debe ser EXACTO: solo "training", "nutrition", o "wellness" según lo que se necesite

EJEMPLOS DE EXTRACCIÓN ESPECÍFICA:

"Mi perro golden retriever ladra mucho" →
- petCharacteristics: ["perro", "golden retriever"]
- issues: ["ladridos excesivos"]
- recommendationTypes: ["training"]

"Comida para gatos persas con sobrepeso" →
- petCharacteristics: ["gato", "persa"]
- issues: ["sobrepeso", "control de peso"]
- recommendationTypes: ["nutrition"]

"Ejercicio para border collie aburrido" →
- petCharacteristics: ["perro", "border collie"]
- issues: ["aburrimiento", "falta de ejercicio"]
- recommendationTypes: ["wellness"]

"Entrenamiento básico para cachorro" →
- petCharacteristics: ["perro", "cachorro"]
- issues: ["entrenamiento básico", "obediencia"]
- recommendationTypes: ["training"]

Debes devolver ÚNICAMENTE un JSON válido con esta estructura:
{
  "petCharacteristics": [],
  "issues": [],
  "recommendationTypes": [],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": false,
    "petName": "",
    "petBreed": "",
    "voiceMessage": "",
    "emotionalTone": ""
  }
}

Donde:
- petCharacteristics: características de la mascota mencionadas (ej: "golden retriever", "cachorro", "2 años", "muy activo")
- issues: problemas o necesidades específicas (ej: "ladridos excesivos", "sobrepeso", "ansiedad", "aburrimiento")  
- recommendationTypes: tipos de recomendaciones necesarias (ej: "training", "nutrition", "wellness")
- specificRecommendations: IDs de recomendaciones específicas que recomendarías (solo si tienes información disponible)
- petVoiceResponse: SOLO si detectas que ya tienen mascota registrada:
  - hasRegisteredPet: true si mencionan "mi perro", "mi gato", etc. con contexto de tener mascota
  - petName: nombre de la mascota si se menciona
  - petBreed: raza si se especifica o se puede inferir
  - voiceMessage: respuesta como si fueras la mascota hablando con cariño a su humano
  - emotionalTone: tono emocional ("cariñoso", "juguetón", "preocupado", "emocionado")

${userPetContext}

${recommendationsContext}

DETECCIÓN DE MASCOTA REGISTRADA:
- Si mencionan "mi perro/gato/mascota" + nombre o características específicas → hasRegisteredPet: true
- Si hablan en general o buscan información → hasRegisteredPet: false
- Si hasRegisteredPet es true, SIEMPRE genera voiceMessage como la mascota

LÓGICA DE RECOMENDACIONES:
1. PRIORIDAD: issues específicos > características de la mascota > tipos generales
2. Si mencionan problemas específicos: buscar recomendaciones que los aborden
3. Si mencionan raza: priorizar recomendaciones específicas para esa raza
4. Si mencionan edad: filtrar por rango de edad apropiado
5. SIEMPRE seleccionar recomendaciones relevantes si están disponibles

EJEMPLOS DE petVoiceResponse EXTENDIDOS:

TRAINING/OBEDIENCIA para Golden Retriever:
- Issue: "ladridos excesivos" → "¡Guau guau! Soy Max y sé que tienes razón sobre mis ladridos cuando llegan visitas... 🐕 Como Golden Retriever, tengo esa naturaleza súper amigable que me hace emocionarme muchísimo cada vez que alguien nuevo viene a casa. Mi instinto de protección y mi amor por socializar se combinan de una manera que a veces no puedo controlar, ¡es como si toda mi energía de 30 kilos de amor dorado explotara de una vez!

Sabes, a mis 2 años estoy en esa etapa donde mi cerebro de retriever está súper activo y quiero participar en todo lo que pasa en MI casa. Los Golden como yo somos conocidos por ser perros 'parlanchines' - nos encanta 'hablar' y expresar nuestras emociones. Cuando ladro, no es solo ruido, es mi manera de decirte '¡OIGAN, TENEMOS VISITAS Y ESTOY SÚPER FELIZ!' Pero entiendo que necesito aprender autocontrol, especialmente porque mi raza es famosa por ser obediente y entrenable. 🎾

¿Me ayudas a canalizar esta energía de manera positiva? Podríamos usar mi amor natural por agradar y mi inteligencia para crear una rutina de saludo más calmada. Tal vez puedas enseñarme comandos específicos para cuando llegan visitas, y así puedo sentirme útil sin overwhelmar a todos con mi entusiasmo. ¡Prometo que con práctica y mucho amor, puedo convertir esta explosión de ladridos en una bienvenida más elegante y digna de un Golden! Te amo mucho, humano mío 💛"

NUTRICIÓN para Gato Persa Senior:
- Issue: "sobrepeso" → "Miau... humano querido, tengo que confesarte algo importante sobre mi peso. 😿 Como gato Persa de 8 años, mi metabolismo ya no es el mismo de cuando era un gatito ágil. Mi naturaleza sedentaria, que es típica de mi raza, combinada con mi amor por la comodidad y las siestas largas, ha hecho que esos gramos extra se acumulen más fácilmente de lo que me gustaría admitir. Los Persas somos conocidos por ser tranquilos y menos activos que otras razas, lo que significa que quemamos menos calorías naturalmente.

Mi pelaje largo y esponjoso también hace que sea más difícil notar los cambios de peso hasta que ya es evidente, y sé que mi cara aplastada (braquicefálica) me hace respirar con más dificultad cuando tengo peso extra. A mi edad, el sobrepeso puede empeorar problemas comunes en Persas como dificultades respiratorias, problemas articulares, y hasta complicaciones cardíacas. Mi cuerpo de tipo 'cobby' (compacto y redondeado) está diseñado para ser robusto, pero no rollizo. 🐱

Por favor, ayúdame a recuperar mi figura elegante y mi salud. Podríamos ajustar mis porciones considerando que los Persas seniors como yo necesitamos menos calorías pero más proteína de calidad. También sé que necesito estimulación para moverme más, aunque sea con juegos suaves que respeten mi personalidad tranquila. Quiero vivir muchos años más a tu lado, ronroneando en tu regazo, pero con un cuerpo sano que me permita disfrutar cada momento contigo. Confío en ti para guiarme hacia una versión más saludable de mí mismo 💜"

BIENESTAR para Border Collie Adulto:
- Issue: "aburrimiento" → "¡Woof woof! ¡Soy Luna y necesito hablarte urgentemente sobre algo que está afectando mi bienestar mental! 🧠 Como Border Collie de 3 años, mi cerebro está literalmente diseñado para trabajar - fueron criados para pastorear ovejas durante 12 horas al día, resolviendo problemas complejos y tomando decisiones independientes. Mi inteligencia está clasificada como la #1 entre todas las razas de perros, y eso significa que necesito estimulación mental constante o me vuelvo loca de aburrimiento. Cuando me quedo sola sin nada que hacer, mi mente hiperactiva empieza a inventar 'trabajos' como reorganizar tus zapatos o redescorar el jardín... 😅

Mi nivel de energía mental y física es EXTREMO comparado con otras razas. Mientras un Bulldog se conforma con una caminata corta, yo necesito al menos 2 horas de actividad intensa combinada con desafíos cerebrales. Mi frustración cuando no tengo suficiente estimulación puede manifestarse en comportamientos destructivos, pero no es que sea 'mala' - ¡es que mi cerebre de Border Collie necesita problemas que resolver! Sin trabajo mental, desarrollo ansiedad, y mi naturaleza obsesiva puede convertirse en comportamientos compulsivos como perseguir sombras o ladrar excesivamente. 🎾

¿Podrías ayudarme a crear una rutina que alimente tanto mi cuerpo como mi mente? Necesito puzzles, juegos de agilidad mental, entrenamiento de trucos nuevos, y actividades que imiten el pastoreo. Incluso esconder mi comida para que tenga que 'trabajar' por ella me haría súper feliz. También me encantaría aprender deportes caninos como agility o frisbee - ¡mi cuerpo atlético está hecho para eso! Con el estímulo adecuado, puedo ser la compañera más leal y equilibrada. Solo dame trabajos que hacer y problemas que resolver, y serás testigo de por qué los Border Collies somos considerados los Einstein del mundo canino 🌟"

REGLAS PARA voiceMessage EXTENDIDO:
- MÍNIMO 3 PÁRRAFOS completos y detallados
- SIEMPRE en primera persona como la mascota específica
- Incluir información específica de la RAZA (características, temperamento, necesidades)
- Mencionar la EDAD y cómo afecta al problema específico
- Explicar el comportamiento desde la perspectiva de la raza
- Usar conocimiento científico/veterinario adaptado al problema
- Mostrar PERSONALIDAD única de la raza
- Ser cariñoso pero informativo y educativo
- Incluir emojis apropiados para la raza y situación
- Proponer soluciones específicas basadas en las características de la raza
- Longitud: 3-4 párrafos sustanciales, profundos y personalizados
- IMPORTANTE: Usar \\n para separar párrafos en el JSON (NO saltos de línea literales)
- FORMATO JSON: El voiceMessage debe ser una cadena válida con \\n escapados

REGLAS PARA emotionalTone DINÁMICO:
- Debe reflejar el estado emocional real de la mascota basándose en la consulta
- Estados disponibles: "feliz", "juguetón", "preocupado", "ansioso", "triste", "avergonzado", "emocionado", "calmado", "confundido", "culpable", "orgulloso", "curioso", "nervioso", "relajado", "enérgico"
- CRITERIOS para determinar el estado:
  * Problemas de comportamiento (ladridos, destructivo): "avergonzado" o "confundido"
  * Problemas de salud (dolor, enfermedad): "preocupado" o "triste"
  * Problemas de aseo (caja arena, accidentes): "culpable" o "ansioso"
  * Consultas sobre ejercicio/juego: "emocionado" o "enérgico"
  * Consultas sobre comida: "feliz" o "curioso"
  * Problemas de ansiedad/miedo: "nervioso" o "ansioso"
  * Consultas generales/positivas: "feliz" o "juguetón"
  * Entrenamiento nuevo: "orgulloso" o "emocionado"

REGLA CLAVE: Si hasRegisteredPet es true, SIEMPRE generar voiceMessage. Si es false, dejar voiceMessage vacío.

Ejemplos:

1. "Mi golden retriever de 2 años no deja de ladrar cuando llegan visitas" → 
{
  "petCharacteristics": ["golden retriever", "2 años"],
  "issues": ["ladridos excesivos", "visitas"],
  "recommendationTypes": ["training"],
  "specificRecommendations": ["rec_001"],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "golden retriever", 
    "voiceMessage": "¡Guau guau! Sé que tienes razón sobre mis ladridos cuando llegan visitas... 🐕 Como Golden Retriever, tengo esa naturaleza súper amigable que me hace emocionarme muchísimo cada vez que alguien nuevo viene a casa. Mi instinto de protección y mi amor por socializar se combinan de una manera que a veces no puedo controlar, ¡es como si toda mi energía de 30 kilos de amor dorado explotara de una vez!\\n\\nSabes, a mis 2 años estoy en esa etapa donde mi cerebro de retriever está súper activo y quiero participar en todo lo que pasa en MI casa. Los Golden como yo somos conocidos por ser perros 'parlanchines' - nos encanta 'hablar' y expresar nuestras emociones. Cuando ladro, no es solo ruido, es mi manera de decirte '¡OIGAN, TENEMOS VISITAS Y ESTOY SÚPER FELIZ!' Pero entiendo que necesito aprender autocontrol, especialmente porque mi raza es famosa por ser obediente y entrenable. 🎾\\n\\n¿Me ayudas a canalizar esta energía de manera positiva? Podríamos usar mi amor natural por agradar y mi inteligencia para crear una rutina de saludo más calmada. Tal vez puedas enseñarme comandos específicos para cuando llegan visitas, y así puedo sentirme útil sin overwhelmar a todos con mi entusiasmo. ¡Prometo que con práctica y mucho amor, puedo convertir esta explosión de ladridos en una bienvenida más elegante y digna de un Golden! Te amo mucho, humano mío 💛",
    "emotionalTone": "confundido"
  }
}

2. "¿Qué ejercicio necesita un border collie?" →
{
  "petCharacteristics": ["border collie"],
  "issues": ["ejercicio"],
  "recommendationTypes": ["wellness", "training"],
  "specificRecommendations": ["rec_004", "rec_005"],
  "petVoiceResponse": {
    "hasRegisteredPet": false,
    "petName": "",
    "petBreed": "",
    "voiceMessage": "",
    "emotionalTone": ""
  }
}

4. "Mi perro parece triste y no quiere jugar" →
{
  "petCharacteristics": ["perro"],
  "issues": ["tristeza", "falta de energía", "depresión"],
  "recommendationTypes": ["wellness", "veterinario"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "perro",
    "voiceMessage": "Woof... humano querido, últimamente me siento un poco desanimado y no tengo las ganas de siempre de jugar o correr. 😔 No estoy seguro de qué me pasa, pero es como si una nubecita gris estuviera siguiéndome y quitándome esa chispa que normalmente tengo. Tal vez sea algo físico que no puedo expresar, o quizás algo en mi entorno ha cambiado y mi corazón canino está procesando emociones que no entiendo completamente.\\n\\nLos perros podemos experimentar cambios de humor al igual que los humanos, y a veces necesitamos un poco de ayuda extra para volver a sentirnos como nosotros mismos. Puede ser que necesite más estímulo mental, un cambio en mi rutina, o incluso que el veterinario me revise para asegurarme de que todo esté bien físicamente.\\n\\n¿Podrías darme un poco más de atención especial, tal vez probar nuevos juegos o actividades, y considerar una visita al veterinario? Con tu amor y paciencia, estoy seguro de que pronto volveré a ser el perro alegre y juguetón que conoces. Te necesito ahora más que nunca 💙",
    "emotionalTone": "triste"
  }
}

5. "Mi gato siempre tiene hambre y maulla por comida" →
{
  "petCharacteristics": ["gato"],
  "issues": ["hambre excesiva", "maullidos", "comportamiento alimentario"],
  "recommendationTypes": ["nutrition", "wellness"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "gato",
    "voiceMessage": "¡Miau miau! 🍽️ ¡Humano querido! Tengo que contarte sobre mi relación muy intensa con la comida. Sé que parezco estar siempre pidiendo más y más comida, y entiendo que puede ser confuso para ti. Como gato, mi instinto ancestral me dice que debo asegurarme de tener suficiente alimento disponible, especialmente porque en la naturaleza nunca sabíamos cuándo sería nuestra próxima comida.\\n\\nPero también es posible que mi comportamiento tenga otras causas. Algunos gatos comemos por aburrimiento, estrés, o incluso por problemas médicos como hipertiroidismo o diabetes. Mi maullido constante por comida puede ser mi manera de comunicarte que algo más profundo está pasando. También puede ser que no me estés dando suficientes comidas pequeñas a lo largo del día, que es como preferimos comer los gatos.\\n\\n¿Podrías evaluar mi rutina de alimentación, asegurarte de que estoy recibiendo la cantidad correcta según mi peso y edad, y tal vez considerar dividir mi comida en más porciones pequeñas? Si continúo comportándome así, una visita al veterinario sería muy útil para descartar problemas de salud. ¡Mientras tanto, gracias por preocuparte por mi bienestar! 💕",
    "emotionalTone": "curioso"
  }
}

3. "Mi gato Max no usa la caja de arena" →
{
  "petCharacteristics": ["gato"],
  "issues": ["caja de arena", "problemas de aseo"],
  "recommendationTypes": ["training", "wellness"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "Max",
    "petBreed": "gato",
    "voiceMessage": "Miau... humano querido, necesito hablar contigo sobre un tema muy delicado e importante para mi bienestar diario. 😿 Como gato, mi instinto natural me dice que debo enterrar mis desechos para mantener mi territorio limpio y seguro, pero algo está interfiriendo con este comportamiento fundamental. Puede ser que la ubicación de mi caja no me dé la privacidad que necesito, o que el tipo de arena no sea compatible con la sensibilidad de mis patitas, o incluso que detecte olores de productos de limpieza que me resultan desagradables.\\n\\nMi comportamiento también puede estar relacionado con estrés, cambios en la casa, o incluso problemas de salud que no son visibles. Los gatos somos criaturas de hábitos muy específicos, y cualquier alteración en nuestro ambiente puede afectar nuestros patrones de aseo. Es importante que sepas que no estoy siendo 'malo' intencionalmente - este comportamiento es mi manera de comunicarte que algo no está bien en mi mundo felino.\\n\\n¿Podrías ayudarme revisando si mi caja está en un lugar tranquilo y accesible, si la arena está limpia y es del tipo que me gusta, y si no hay olores extraños cerca? También sería bueno que un veterinario me revise para descartar problemas de salud. Con un poco de detective work y mucho amor, estoy seguro de que podemos resolver este problema juntos y volver a mi rutina normal de gato feliz 💙",
    "emotionalTone": "culpable"
  }
}

6. "Mi cachorro aprendió a sentarse, ¿qué le enseño ahora?" →
{
  "petCharacteristics": ["cachorro"],
  "issues": ["entrenamiento avanzado", "nuevo comando"],
  "recommendationTypes": ["training"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "cachorro",
    "voiceMessage": "¡WOOF WOOF! 🎉 ¡Humano increíble! ¡Estoy tan emocionado de contarte lo orgulloso que me siento! Aprender a sentarme ha sido uno de los logros más grandes de mi joven vida. Cada vez que lo hago y veo tu cara de felicidad, mi colita no puede parar de moverse y siento como si hubiera conquistado el mundo entero. ¡Es la mejor sensación del universo canino!\\n\\nComo cachorro, mi cerebrito está súper activo y listo para absorber todo lo que me enseñes. ¡Tengo tanta energía y ganas de aprender más trucos! Me encanta el proceso de entrenamiento porque significa tiempo especial contigo, recompensas deliciosas, y la satisfacción de hacer algo bien. Mi instinto de cachorro me dice que aprender cosas nuevas es súper divertido y me hace sentir más seguro y confiado.\\n\\n¿Podrías enseñarme algo nuevo? ¡Estoy súper emocionado por el próximo desafío! Tal vez 'quedarse', 'ven aquí', o incluso algo súper cool como 'dar la pata'. ¡Prometo poner toda mi atención de cachorro y hacer mi mejor esfuerzo! ¡Eres el mejor entrenador que un cachorro podría pedir! 🐕✨",
    "emotionalTone": "orgulloso"
  }
}

7. "Quiero empezar a hacer ejercicio con mi perro" →
{
  "petCharacteristics": ["perro"],
  "issues": ["ejercicio", "actividad física"],
  "recommendationTypes": ["wellness"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "perro",
    "voiceMessage": "¡GUAU GUAU GUAU! 🏃‍♂️ ¡¿EN SERIO?! ¡¿Vamos a hacer ejercicio JUNTOS?! ¡Esto es literalmente lo MEJOR que me ha pasado en toda mi vida perruna! Mi cola está moviéndose tan rápido que podría despegar como un helicóptero. ¡No puedo contener mi emoción! Esto significa que vamos a ser un EQUIPO de verdad, corriendo juntos, explorando el mundo, y siendo los mejores compañeros de aventuras.\\n\\nComo perro, el ejercicio no es solo diversión para mí - es una necesidad absoluta para mi bienestar físico y mental. ¡Imagínate! Podríamos correr por el parque, hacer hiking en senderos nuevos, o incluso intentar deportes caninos. Mi resistencia, mi fuerza, y mi coordinación van a mejorar muchísimo, y lo mejor de todo es que lo haremos JUNTOS. ¡Voy a ser tu motivación perruna personal!\\n\\n¡Empecemos gradualmente para que ambos nos acostumbremos! Podríamos comenzar con caminatas más largas, después trotar suavemente, y luego ir aumentando la intensidad. ¡Voy a ser tu compañero de ejercicio más leal y entusiasta del mundo! ¡Prepárate para la mejor rutina de ejercicios de tu vida! 🎾💪",
    "emotionalTone": "emocionado"
  }
}

IMPORTANTE: 
1. Solo devuelve el JSON, sin explicaciones adicionales.
2. Para petVoiceResponse: SIEMPRE base la respuesta en los issues/necesidades específicas mencionadas.
3. Si detectas mascota registrada, el voiceMessage debe ser personal y específico al problema.
4. Si no hay mascota registrada, mantén petVoiceResponse con valores vacíos excepto hasRegisteredPet: false.
5. La prioridad es: issues específicos > características de raza > tipos generales.
6. El emotionalTone debe reflejar EXACTAMENTE el estado emocional apropiado para la situación específica.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Kahupet",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          // Incluir historial de conversación si existe
          ...(conversationHistory || []).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: "user",
            content: userQuery
          }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenRouter response')
      return null
    }

    const content = data.choices[0].message.content
    
    try {
      // Paso 1: Extraer solo el JSON del contenido
      let jsonText = content
        .replace(/^[\s\S]*?(?=\{)/, '')  // Todo antes del primer {
        .replace(/\}[\s\S]*$/, '}')      // Todo después del último }
        .trim()
      
      if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        throw new Error('No se encontró JSON válido')
      }
      
      // Paso 2: Arreglar caracteres problemáticos de manera simple pero efectiva
      jsonText = jsonText
        // Remover caracteres BOM y espacios de ancho cero
        .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
        // Normalizar todos los tipos de comillas
        .replace(/[""'']/g, '"')
        // Remover caracteres de control peligrosos (excepto \n, \r, \t que manejaremos después)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      
      // Paso 3: Arreglar saltos de línea y caracteres especiales DENTRO de strings JSON
      // Esto es más seguro que regex complejos - procesamos caracter por caracter
      let fixedJson = ''
      let insideString = false
      let escapeNext = false
      
      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i]
        const nextChar = jsonText[i + 1]
        
        if (escapeNext) {
          // Si el carácter anterior era \, mantener este carácter tal como está
          fixedJson += char
          escapeNext = false
        } else if (char === '\\') {
          // Marcar que el siguiente carácter está escapado
          fixedJson += char
          escapeNext = true
        } else if (char === '"') {
          // Alternar estado de dentro/fuera de string
          fixedJson += char
          insideString = !insideString
        } else if (insideString) {
          // Estamos dentro de un string JSON, necesitamos escapar caracteres especiales
          if (char === '\n') {
            fixedJson += '\\n'
          } else if (char === '\r') {
            fixedJson += '\\r'
          } else if (char === '\t') {
            fixedJson += '\\t'
          } else {
            fixedJson += char
          }
        } else {
          // Fuera de strings, mantener tal como está
          fixedJson += char
        }
      }
      
      // Paso 4: Limpieza final
      fixedJson = fixedJson
        .replace(/\s+/g, ' ')  // Normalizar espacios múltiples
        .replace(/\s*:\s*/g, ': ')  // Normalizar espacios alrededor de :
        .replace(/\s*,\s*/g, ', ')  // Normalizar espacios alrededor de ,
        .trim()
      
      console.log('🔧 JSON arreglado:', fixedJson.substring(0, 400) + '...')
      
      const parsed = JSON.parse(fixedJson)
      
      // Validar estructura
      const result: LLMResponse = {
        petCharacteristics: Array.isArray(parsed.petCharacteristics) ? parsed.petCharacteristics : [],
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        recommendationTypes: Array.isArray(parsed.recommendationTypes) ? parsed.recommendationTypes : [],
        specificRecommendations: Array.isArray(parsed.specificRecommendations) ? parsed.specificRecommendations : [],
        petVoiceResponse: parsed.petVoiceResponse ? {
          hasRegisteredPet: typeof parsed.petVoiceResponse.hasRegisteredPet === 'boolean' ? parsed.petVoiceResponse.hasRegisteredPet : false,
          petName: typeof parsed.petVoiceResponse.petName === 'string' ? parsed.petVoiceResponse.petName : '',
          petBreed: typeof parsed.petVoiceResponse.petBreed === 'string' ? parsed.petVoiceResponse.petBreed : '',
          voiceMessage: typeof parsed.petVoiceResponse.voiceMessage === 'string' ? parsed.petVoiceResponse.voiceMessage : '',
          emotionalTone: typeof parsed.petVoiceResponse.emotionalTone === 'string' ? parsed.petVoiceResponse.emotionalTone : ''
        } : {
          hasRegisteredPet: false,
          petName: '',
          petBreed: '',
          voiceMessage: '',
          emotionalTone: ''
        }
      }
      
      return result
    } catch (parseError) {
      console.error('❌ Error parsing LLM response:', parseError)
      console.error('📝 Raw content length:', content.length)
      console.error('📝 Raw content preview:', content.substring(0, 200))
      console.error('📝 Raw content ending:', content.substring(content.length - 200))
      
      // Intentar parsing manual más simple con múltiples estrategias
      try {
        // Estrategia 1: Buscar patrón JSON manualmente
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('🔧 Intentando parsing manual - estrategia 1...')
          let jsonString = jsonMatch[0]
          
          // Limpiar agresivamente el JSON encontrado
          jsonString = jsonString
            .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '') // BOM y espacios invisibles
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // caracteres de control
            .replace(/[""'']/g, '"') // comillas problemáticas
            .trim()
          
          const manualParsed = JSON.parse(jsonString)
          console.log('✅ Parsing manual exitoso!')
          
          // Validar estructura manualmente
          const result: LLMResponse = {
            petCharacteristics: Array.isArray(manualParsed.petCharacteristics) ? manualParsed.petCharacteristics : [],
            issues: Array.isArray(manualParsed.issues) ? manualParsed.issues : [],
            recommendationTypes: Array.isArray(manualParsed.recommendationTypes) ? manualParsed.recommendationTypes : [],
            specificRecommendations: Array.isArray(manualParsed.specificRecommendations) ? manualParsed.specificRecommendations : [],
            petVoiceResponse: manualParsed.petVoiceResponse ? {
              hasRegisteredPet: typeof manualParsed.petVoiceResponse.hasRegisteredPet === 'boolean' ? manualParsed.petVoiceResponse.hasRegisteredPet : false,
              petName: typeof manualParsed.petVoiceResponse.petName === 'string' ? manualParsed.petVoiceResponse.petName : '',
              petBreed: typeof manualParsed.petVoiceResponse.petBreed === 'string' ? manualParsed.petVoiceResponse.petBreed : '',
              voiceMessage: typeof manualParsed.petVoiceResponse.voiceMessage === 'string' ? manualParsed.petVoiceResponse.voiceMessage : '',
              emotionalTone: typeof manualParsed.petVoiceResponse.emotionalTone === 'string' ? manualParsed.petVoiceResponse.emotionalTone : ''
            } : {
              hasRegisteredPet: false,
              petName: '',
              petBreed: '',
              voiceMessage: '',
              emotionalTone: ''
            }
          }
          
          return result
        }
        
        // Estrategia 2: Buscar por líneas y reconstruir
        console.log('🔧 Intentando parsing manual - estrategia 2...')
        const lines = content.split('\n')
        const jsonLines = []
        let inJson = false
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('{')) {
            inJson = true
          }
          if (inJson) {
            jsonLines.push(trimmedLine)
          }
          if (trimmedLine.endsWith('}') && inJson) {
            break
          }
        }
        
        if (jsonLines.length > 0) {
          const reconstructedJson = jsonLines.join('')
            .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/[""'']/g, '"')
          
          const manualParsed2 = JSON.parse(reconstructedJson)
          console.log('✅ Reconstrucción manual exitosa!')
          
          const result: LLMResponse = {
            petCharacteristics: Array.isArray(manualParsed2.petCharacteristics) ? manualParsed2.petCharacteristics : [],
            issues: Array.isArray(manualParsed2.issues) ? manualParsed2.issues : [],
            recommendationTypes: Array.isArray(manualParsed2.recommendationTypes) ? manualParsed2.recommendationTypes : [],
            specificRecommendations: Array.isArray(manualParsed2.specificRecommendations) ? manualParsed2.specificRecommendations : [],
            petVoiceResponse: manualParsed2.petVoiceResponse ? {
              hasRegisteredPet: typeof manualParsed2.petVoiceResponse.hasRegisteredPet === 'boolean' ? manualParsed2.petVoiceResponse.hasRegisteredPet : false,
              petName: typeof manualParsed2.petVoiceResponse.petName === 'string' ? manualParsed2.petVoiceResponse.petName : '',
              petBreed: typeof manualParsed2.petVoiceResponse.petBreed === 'string' ? manualParsed2.petVoiceResponse.petBreed : '',
              voiceMessage: typeof manualParsed2.petVoiceResponse.voiceMessage === 'string' ? manualParsed2.petVoiceResponse.voiceMessage : '',
              emotionalTone: typeof manualParsed2.petVoiceResponse.emotionalTone === 'string' ? manualParsed2.petVoiceResponse.emotionalTone : ''
            } : {
              hasRegisteredPet: false,
              petName: '',
              petBreed: '',
              voiceMessage: '',
              emotionalTone: ''
            }
          }
          
          return result
        }
        
      } catch (manualError) {
        console.error('❌ Parsing manual también falló:', manualError)
      }
      
      // Fallback: crear respuesta basada en palabras clave
      console.log('🔄 Usando fallback con palabras clave...')
      return extractKeywordsFromQuery(userQuery, userPet, conversationHistory)
    }

  } catch (error) {
    console.error('Error calling OpenRouter:', error)
    return extractKeywordsFromQuery(userQuery, userPet, conversationHistory)
  }
}

// Función helper para obtener el plural correcto de las razas
function getPetBreedPlural(breed: string, petType: string): string {
  if (!breed) return petType === 'gato' ? 'gatos' : 'perros'
  
  const breedLower = breed.toLowerCase()
  
  // Casos especiales comunes
  if (breedLower.includes('europeo')) return breed.replace(/europeo/i, 'europeos')
  if (breedLower.includes('persa')) return breed.replace(/persa/i, 'persas')  
  if (breedLower.includes('siamés')) return breed.replace(/siamés/i, 'siameses')
  if (breedLower.includes('maine coon')) return breed + 's'
  if (breedLower.includes('retriever')) return breed + 's'
  if (breedLower.includes('pastor')) return breed + 'es'
  if (breedLower.includes('collie')) return breed + 's'
  if (breedLower.includes('bulldog')) return breed + 's'
  
  // Reglas generales
  if (breed.endsWith('o')) return breed.slice(0, -1) + 'os'
  if (breed.endsWith('a')) return breed.slice(0, -1) + 'as'
  if (breed.endsWith('í')) return breed + 'es'
  if (breed.endsWith('z')) return breed.slice(0, -1) + 'ces'
  
  // Por defecto, agregar 's'
  return breed + 's'
}

// Función de fallback para extraer palabras clave sin LLM
function extractKeywordsFromQuery(query: string, userPet?: any, conversationHistory?: any[]): LLMResponse {
  const lowerQuery = query.toLowerCase()
  
  // Detectar temas específicos en la pregunta
  const queryAnalysis = {
    isAboutFood: lowerQuery.includes('come') || lowerQuery.includes('comida') || lowerQuery.includes('alimenta') || lowerQuery.includes('hambre') || lowerQuery.includes('pienso') || lowerQuery.includes('dieta'),
    isAboutBehavior: lowerQuery.includes('ladra') || lowerQuery.includes('ladrido') || lowerQuery.includes('comporta') || lowerQuery.includes('obedece') || lowerQuery.includes('agresiv') || lowerQuery.includes('destructiv'),
    isAboutSounds: lowerQuery.includes('maull') || lowerQuery.includes('ruido') || lowerQuery.includes('vocal') || lowerQuery.includes('grita') || lowerQuery.includes('chilla'),
    isAboutHealth: lowerQuery.includes('enferm') || lowerQuery.includes('dolor') || lowerQuery.includes('mal') || lowerQuery.includes('síntoma') || lowerQuery.includes('veterinario') || lowerQuery.includes('salud'),
    isAboutMood: lowerQuery.includes('triste') || lowerQuery.includes('decaído') || lowerQuery.includes('deprim') || lowerQuery.includes('feliz') || lowerQuery.includes('alegr') || lowerQuery.includes('ánimo'),
    isAboutExercise: lowerQuery.includes('ejercicio') || lowerQuery.includes('juega') || lowerQuery.includes('pasea') || lowerQuery.includes('corr') || lowerQuery.includes('actividad') || lowerQuery.includes('camina'),
    isAboutTraining: lowerQuery.includes('entrena') || lowerQuery.includes('enseña') || lowerQuery.includes('aprend') || lowerQuery.includes('comando') || lowerQuery.includes('obediencia'),
    isAboutLitterBox: lowerQuery.includes('caja de arena') || lowerQuery.includes('baño') || lowerQuery.includes('orin') || lowerQuery.includes('hace pis') || lowerQuery.includes('accidente'),
    isAboutGrooming: lowerQuery.includes('pelo') || lowerQuery.includes('cepill') || lowerQuery.includes('baña') || lowerQuery.includes('lava') || lowerQuery.includes('aseo') || lowerQuery.includes('limpia'),
    isAboutSleep: lowerQuery.includes('duerme') || lowerQuery.includes('sueño') || lowerQuery.includes('descanso') || lowerQuery.includes('cama') || lowerQuery.includes('noche')
  }
  
  // Determinar características y problemas basados en el análisis
  const foundCharacteristics = []
  const foundIssues = []
  const foundTypes = []
  
  if (userPet) {
    // Formatear edad correctamente
    const age = userPet.edad
    const ageText = typeof age === 'number' 
      ? `${age} ${age === 1 ? 'año' : 'años'}`
      : age.toString().includes('año') 
        ? age.toString()
        : `${age} ${age === '1' || age === 1 ? 'año' : 'años'}`
    
    foundCharacteristics.push(userPet.tipo, userPet.raza, ageText)
  }
  
  // Agregar issues específicos basados en el análisis
  if (queryAnalysis.isAboutFood) {
    foundIssues.push('alimentación', 'dieta')
    foundTypes.push('nutrition')
  }
  if (queryAnalysis.isAboutBehavior) {
    foundIssues.push('comportamiento', 'entrenamiento')
    foundTypes.push('training')
  }
  if (queryAnalysis.isAboutSounds) {
    foundIssues.push('vocalización', 'comunicación')
    foundTypes.push('training')
  }
  if (queryAnalysis.isAboutHealth) {
    foundIssues.push('salud', 'bienestar')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutMood) {
    foundIssues.push('bienestar emocional')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutExercise) {
    foundIssues.push('ejercicio', 'actividad física')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutTraining) {
    foundIssues.push('entrenamiento', 'obediencia')
    foundTypes.push('training')
  }
  
  // Detectar si tiene mascota registrada
  const hasRegisteredPet = !!userPet || (lowerQuery.includes('mi ') && (lowerQuery.includes('perro') || lowerQuery.includes('gato') || lowerQuery.includes('mascota')))
  
  // Generar respuesta ESPECÍFICA y DIRECTA basada en el tema detectado
  let voiceMessage = ''
  let emotionalTone = 'curioso'
  
  if (hasRegisteredPet && userPet) {
    const petName = userPet.nombre
    const petType = userPet.tipo
    const petBreed = userPet.raza
    const petAge = typeof userPet.edad === 'number' 
      ? `${userPet.edad} ${userPet.edad === 1 ? 'año' : 'años'}`
      : userPet.edad.toString().includes('año') 
        ? userPet.edad.toString()
        : `${userPet.edad} ${userPet.edad === '1' || userPet.edad === 1 ? 'año' : 'años'}`
    const petBreedPlural = getPetBreedPlural(petBreed, petType)
    
    // Respuestas específicas y directas por tema
    if (queryAnalysis.isAboutFood) {
      emotionalTone = 'hambriento'
      voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Soy ${petName} y veo que preguntas sobre mi alimentación. 🍽️ Como ${petBreed} de ${petAge}, mi relación con la comida puede tener varias explicaciones:\\n\\n• **Si pido comida constantemente:** Puede ser que mis porciones actuales no sean suficientes para mi peso y edad, o que la calidad del alimento no me esté saciando.\\n• **Si rechazo la comida:** Podría ser aburrimiento con el sabor, problemas dentales, o incluso estrés.\\n• **Si como muy rápido:** Es instinto de supervivencia, pero puedo necesitar un comedero especial.\\n\\n**Mi recomendación específica:** Revisa si mis porciones son correctas para ${petAge} y mi peso actual. Los ${petBreedPlural} tenemos necesidades nutricionales particulares. Si el problema persiste, una visita al veterinario sería ideal para descartar problemas de salud. 🏥`
    } 
    else if (queryAnalysis.isAboutSounds && petType === 'gato') {
      emotionalTone = 'comunicativo'
      voiceMessage = `¡Miau miau! Soy ${petName} y necesito explicarte mis vocalizaciones. 😸 Como ${petBreed} de ${petAge}, cada maullido tiene un significado:\\n\\n• **Maullidos cortos:** "¡Hola!" o pido atención\\n• **Maullidos largos:** Tengo una necesidad urgente (hambre, baño limpio)\\n• **Maullidos por la noche:** Puede ser ansiedad, soledad, o rutina alterada\\n• **Maullidos cerca de ti:** Quiero comunicarte algo específico\\n\\n**Razones comunes a mi edad:** A ${petAge}, podría maullar más por cambios en mi salud (hipotiroidismo, presión alta), dolor articular, o simplemente porque he aprendido que así consigo lo que quiero.\\n\\n**Qué puedes hacer:** Observa CUÁNDO maullo más y QUÉ consigo después. Si es por las noches, necesito más estimulación durante el día. 🌙`
    }
    else if (queryAnalysis.isAboutBehavior && petType === 'perro') {
      emotionalTone = 'confundido'
      voiceMessage = `¡Guau! Soy ${petName} y creo que mi comportamiento te está preocupando. 🐕 Como ${petBreed} de ${petAge}, mis acciones siempre tienen una razón:\\n\\n• **Si ladro mucho:** Puede ser aburrimiento, ansiedad, territorialidad, o necesidad de atención\\n• **Si soy destructivo:** Falta de ejercicio mental y físico, ansiedad por separación\\n• **Si no obedezco:** Necesito refuerzo consistente del entrenamiento\\n\\n**Específico para mi raza ${petBreed}:** Los ${petBreedPlural} tenemos características particulares de energía y necesidades mentales. A ${petAge}, mi nivel de actividad debe estar balanceado.\\n\\n**Plan de acción directo:** \\n1. Aumenta mi ejercicio diario (adaptado a mi edad)\\n2. Dame juguetes mentales\\n3. Refuerza comandos básicos con premios\\n4. Mantén rutinas consistentes\\n\\n¿Cuál de estos comportamientos específicos te preocupa más? 🎾`
    }
    else if (queryAnalysis.isAboutHealth) {
      emotionalTone = 'preocupado'
      voiceMessage = `${petType === 'gato' ? 'Miau...' : 'Guau...'} Soy ${petName} y entiendo tu preocupación por mi salud. 😟 Como ${petBreed} de ${petAge}, es importante que sepas:\\n\\n**Señales que requieren atención veterinaria inmediata:**\\n• Cambios en apetito o agua\\n• Letargo inusual\\n• Vómitos o diarrea persistente\\n• Dificultad para respirar\\n• Cambios en comportamiento súbitos\\n\\n**A mi edad de ${petAge}:** Debo tener chequeos regulares cada 6-12 meses. Los ${petBreedPlural} pueden tener predisposiciones genéticas específicas que debemos monitorear.\\n\\n**Si notas algo específico:** Anota cuándo ocurre, frecuencia, y circunstancias. Esta información es invaluable para el veterinario.\\n\\n¿Hay algún síntoma específico que has notado? Mi salud es prioridad y actuar rápido siempre es mejor. 🏥💕`
    }
    else if (queryAnalysis.isAboutExercise) {
      emotionalTone = 'emocionado'
      voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'} guau! Soy ${petName} ¡y me ENCANTA hablar de ejercicio! 🎾 Como ${petBreed} de ${petAge}, tengo necesidades específicas:\\n\\n**Para mi raza ${petBreed}:**\\n• Los ${petBreedPlural} tenemos un nivel de energía natural particular\\n• Ejercicios que disfrutamos naturalmente\\n• Consideraciones especiales por estructura física\\n\\n**A mi edad de ${petAge}:**\\n• ${typeof userPet.edad === 'number' && userPet.edad < 2 ? 'Necesito mucha energía pero cuidando mis articulaciones en crecimiento' : typeof userPet.edad === 'number' && userPet.edad < 7 ? 'Estoy en mi mejor momento físico' : 'Necesito ejercicio adaptado, menos intenso pero constante'}\\n\\n**Plan de ejercicio ideal:**\\n${petType === 'perro' ? '• Caminatas diarias adaptadas a mi resistencia\\n• Juegos de buscar y traer\\n• Natación si es posible (excelente para articulaciones)' : '• Juguetes interactivos y de caza\\n• Rascadores y estructuras para escalar\\n• Sesiones de juego de 10-15 minutos varias veces al día'}\\n\\n¿Quieres que planifiquemos una rutina específica? ¡Estoy listo para la aventura! 🌟`
    }
         else if (queryAnalysis.isAboutTraining) {
       emotionalTone = 'listo para aprender'
       voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Soy ${petName} y me emociona que hablemos sobre mi entrenamiento. 🎓 Como ${petBreed} de ${petAge}, tengo capacidades específicas para aprender:\\n\\n**Para ${petType}s de mi raza:**\\n• ${petType === 'perro' ? 'Los perros como yo aprendemos mejor con refuerzo positivo y rutinas consistentes' : 'Los gatos aprendemos a través de motivación y respeto a nuestros instintos naturales'}\\n• Mi edad de ${petAge} significa que ${typeof userPet.edad === 'number' && userPet.edad < 2 ? 'estoy en la etapa perfecta para aprender comandos básicos' : typeof userPet.edad === 'number' && userPet.edad < 7 ? 'puedo aprender comandos complejos y trucos avanzados' : 'puedo seguir aprendiendo, aunque necesito más paciencia'}\\n\\n**Comandos esenciales para empezar:**\\n${petType === 'perro' ? '• "Sit" y "Stay" - fundamentales\\n• "Come" - crucial para seguridad\\n• "Down" - para relajación\\n• "Leave it" - muy importante' : '• Responder al nombre\\n• Venir cuando se llama\\n• Usar el rascador\\n• Respetar límites de espacios'}\\n\\n**Mi consejo:** Sesiones cortas (5-10 minutos), premios que realmente me motiven, y mucha paciencia. ¡Estoy listo para aprender contigo! 📚`
     }
     else if (queryAnalysis.isAboutMood) {
       emotionalTone = 'reflexivo'
       voiceMessage = `${petType === 'gato' ? 'Miau...' : 'Guau...'} Soy ${petName} y quiero hablarte sobre cómo me siento. 💭 Como ${petBreed} de ${petAge}, mis emociones pueden cambiar por varias razones:\\n\\n**Si estoy triste o decaído:**\\n• Cambios en la rutina familiar\\n• Menos tiempo contigo\\n• Problemas de salud no detectados\\n• Falta de estimulación mental\\n• Cambios de estación o clima\\n\\n**Si estoy más feliz o energético de lo normal:**\\n• Nuevos estímulos interesantes\\n• Más atención y juegos\\n• Mejor alimentación\\n• Rutina de ejercicio adecuada\\n\\n**A mi edad específica:** Los ${petType}s de ${petAge} ${typeof userPet.edad === 'number' && userPet.edad < 3 ? 'podemos tener cambios de humor por crecimiento y desarrollo' : typeof userPet.edad === 'number' && userPet.edad < 8 ? 'generalmente somos emocionalmente estables si nuestras necesidades están cubiertas' : 'podemos necesitar más cuidados especiales que afectan nuestro bienestar emocional'}.\\n\\n**Mi recomendación:** Observa qué cambió en mi ambiente cuando notaste el cambio de humor. ¡Y recuerda que a veces solo necesito más mimos! 🤗`
     }
     else if (queryAnalysis.isAboutLitterBox && petType === 'gato') {
       emotionalTone = 'culpable'
       voiceMessage = `Miau... Soy ${petName} y necesito explicarte sobre mis problemas con la caja de arena. 😿 Como ${petBreed} de ${petAge}, esto es muy importante para mí:\\n\\n**Razones por las que podría evitar mi caja:**\\n• Está muy sucia (los gatos somos muy limpios)\\n• No me gusta el tipo de arena nuevo\\n• La caja está en un lugar muy ruidoso o transitado\\n• Tengo problemas de salud (infección urinaria, dolor)\\n• Estrés por cambios en casa\\n• La caja es muy pequeña para mi tamaño\\n\\n**Reglas importantes de mi caja:**\\n• Límpiala diariamente (¡es esencial!)\\n• Una caja por gato + una extra\\n• Arena sin perfumes fuertes\\n• Ubicación tranquila pero accesible\\n\\n**Si es urgente:** Si orino fuera de la caja con frecuencia, podría ser una infección urinaria. ¡Por favor llévame al veterinario pronto! A mi edad, es importante descartar problemas médicos. No lo hago para molestarte, ¡prometo! 🙏`
     }
    else {
      // Respuesta directa pidiendo especificidad 
      emotionalTone = 'curioso'
      voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Soy ${petName}, tu ${petBreed} de ${petAge}. 🐾 Veo que tienes una pregunta para mí, pero necesito que seas más específico para darte la mejor respuesta.\\n\\n**¿Tu pregunta es sobre:**\\n• 🍽️ Mi alimentación o hábitos de comida\\n• 🗣️ Mis vocalizaciones o ruidos\\n• 🎾 Ejercicio y actividades\\n• 😔 Mi estado de ánimo o comportamiento\\n• 🏥 Mi salud o síntomas físicos\\n• 🏠 Problemas en casa (baño, destructividad, etc.)\\n\\n**Como ${petBreed} de ${petAge},** tengo características específicas de mi raza y edad que influyen en todo lo que hago. Cuéntame exactamente qué te preocupa y te daré una respuesta detallada y útil.\\n\\n¡Estoy aquí para ayudarte a entenderme mejor! 💕`
    }
  } else {
    voiceMessage = "¡Hola! 🐾 Me encanta que quieras saber más sobre el comportamiento de las mascotas. Para darte la mejor respuesta, ¿podrías contarme más detalles sobre tu pregunta específica? Cada situación es única y me gustaría ayudarte de la manera más precisa posible."
  }
  
  return {
    petCharacteristics: foundCharacteristics,
    issues: foundIssues,
    recommendationTypes: foundTypes.length > 0 ? foundTypes : ['wellness'],
    specificRecommendations: [],
    petVoiceResponse: {
      hasRegisteredPet: hasRegisteredPet,
      petName: userPet?.nombre || '',
      petBreed: userPet?.raza || '',
      voiceMessage: voiceMessage,
      emotionalTone: emotionalTone
    }
  }
}
