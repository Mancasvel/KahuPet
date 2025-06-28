'use client'

import { useState, useEffect } from 'react'
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button, 
  Input, 
  Select, 
  SelectItem,
  Textarea,
  Card,
  CardBody,
  Divider
} from '@heroui/react'

interface PetRegistrationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (pet: any) => void
  existingPet?: any // Para edición
}

export default function PetRegistrationForm({ isOpen, onClose, onSuccess, existingPet }: PetRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Pre-llenar el formulario si hay una mascota existente
  useEffect(() => {
    if (existingPet && isOpen) {
      setFormData({
        name: existingPet.nombre || '',
        type: existingPet.tipo || '',
        breed: existingPet.raza || '',
        age: existingPet.edad ? existingPet.edad.toString() : '',
        weight: existingPet.peso ? existingPet.peso.toString() : '',
        gender: existingPet.genero || '',
        notes: existingPet.notas || ''
      })
    } else if (!existingPet && isOpen) {
      // Limpiar formulario para nuevo registro
      setFormData({
        name: '',
        type: '',
        breed: '',
        age: '',
        weight: '',
        gender: '',
        notes: ''
      })
    }
  }, [existingPet, isOpen])

  const dogBreeds = [
    "Labrador Retriever",
    "American Stafford",
    "Golden Retriever", 
    "Pastor Alemán",
    "Bulldog Francés",
    "Bulldog Inglés",
    "Beagle",
    "Poodle (Caniche)",
    "Chihuahua",
    "Yorkshire Terrier",
    "Dachshund (Teckel)",
    "Boxer",
    "Rottweiler",
    "Border Collie",
    "Cocker Spaniel",
    "Shih Tzu",
    "Schnauzer Miniatura",
    "Akita Inu",
    "Bichón Frisé",
    "Maltés",
    "Pomerania",
    "Husky Siberiano",
    "Alaskan Malamute",
    "Doberman",
    "Dálmata",
    "Staffordshire Bull Terrier",
    "Bóxer Americano",
    "Galgo Español",
    "Boston Terrier",
    "Jack Russell Terrier",
    "Pastor Australiano",
    "Samoyedo",
    "Basenji",
    "Cavalier King Charles Spaniel",
    "West Highland White Terrier",
    "Shar Pei",
    "Cane Corso",
    "Gran Danés",
    "San Bernardo",
    "Setter Irlandés",
    "Perro de Agua Español",
    "Braco Alemán",
    "Weimaraner",
    "Shiba Inu",
    "Lhasa Apso",
    "Cairn Terrier",
    "Fox Terrier",
    "Chow Chow",
    "Pekinés",
    "Saluki",
    "Bullmastiff"
  ]

  const catBreeds = [
    "Persa",
    "Siamés",
    "Maine Coon",
    "Ragdoll",
    "Bengala",
    "Sphynx",
    "Azul Ruso",
    "British Shorthair",
    "Scottish Fold",
    "Birmano",
    "Abisinio",
    "Oriental",
    "Angora Turco",
    "Noruego del Bosque",
    "Gato Europeo",
    "Himalayo",
    "Gato Exótico",
    "Cornish Rex",
    "Devon Rex",
    "Munchkin",
    "Manx",
    "Balinés",
    "Savannah",
    "Toyger",
    "Ocicat",
    "American Shorthair",
    "American Curl",
    "Bombay",
    "Tonkinés",
    "Somali",
    "Chartreux",
    "Gato Egipcio Mau",
    "Gato Himalayo",
    "Gato Peterbald",
    "Gato Khao Manee",
    "LaPerm",
    "Kurilian Bobtail",
    "Neva Masquerade",
    "Serengeti",
    "Burmés",
    "Singapura",
    "Gato de Bengala de Pelo Largo",
    "Gato de Pelo Corto Oriental",
    "Gato Selkirk Rex",
    "Cymric",
    "Sokoke",
    "Lykoi (Gato Hombre Lobo)",
    "Ragamuffin",
    "Gato Van Turco",
    "Gato Tiffanie"
  ]

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.breed) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    setIsLoading(true)
    try {
      const petData = {
        nombre: formData.name,
        tipo: formData.type,
        raza: formData.breed,
        edad: formData.age ? parseInt(formData.age) : null,
        peso: formData.weight ? parseFloat(formData.weight) : null,
        genero: formData.gender,
        notas: formData.notes
      }

      let response
      let successMessage

      if (existingPet) {
        // Actualizar mascota existente
        response = await fetch(`/api/user-pets?petId=${existingPet._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(petData)
        })
        successMessage = 'Mascota actualizada exitosamente'
      } else {
        // Crear nueva mascota
        response = await fetch('/api/user-pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(petData)
        })
        successMessage = 'Mascota registrada exitosamente'
      }

      if (response.ok) {
        const result = await response.json()
        onSuccess(existingPet ? { ...existingPet, ...petData } : result.pet)
        onClose()
        console.log(successMessage)
      } else {
        const error = await response.json()
        if (response.status === 401) {
          alert('Debes iniciar sesión para registrar mascotas')
        } else {
          alert(`Error: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error con la mascota:', error)
      alert(existingPet ? 'Error al actualizar la mascota' : 'Error al registrar la mascota')
    } finally {
      setIsLoading(false)
    }
  }

  const breeds = formData.type === 'perro' ? dogBreeds : catBreeds

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        base: "border border-gray-200 mx-2 my-2 sm:mx-6 sm:my-16",
        header: "border-b-[1px] border-gray-200",
        body: "py-4",
        footer: "border-t-[1px] border-gray-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🐾</span>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {existingPet ? 'Editar mascota' : 'Registra tu mascota'}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {existingPet ? 'Actualiza los datos de tu compañero' : 'Cuéntanos sobre tu nuevo compañero'}
            </p>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <Card className="w-full max-w-2xl mx-auto border-0 shadow-none">
            <CardBody className="px-1 sm:px-6 py-2">
              <div className="space-y-4 sm:space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span>📋</span>
                    Información básica
                  </h3>
                  
                  <Input
                    label="Nombre de tu mascota"
                    placeholder="Ej: Max, Luna, Rocky..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    isRequired
                    startContent={<span className="text-default-400">🏷️</span>}
                    variant="bordered"
                    size="lg"
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Tipo de mascota"
                      placeholder="Selecciona el tipo"
                      selectedKeys={formData.type ? [formData.type] : []}
                      onChange={(e) => setFormData({...formData, type: e.target.value, breed: ''})}
                      isRequired
                      variant="bordered"
                      size="lg"
                    >
                      <SelectItem key="perro" startContent="🐕">Perro</SelectItem>
                      <SelectItem key="gato" startContent="🐱">Gato</SelectItem>
                    </Select>

                    {formData.type && (
                      <Select
                        label="Raza"
                        placeholder="Selecciona la raza"
                        selectedKeys={formData.breed ? [formData.breed] : []}
                        onChange={(e) => setFormData({...formData, breed: e.target.value})}
                        isRequired
                        variant="bordered"
                        size="lg"
                      >
                        {breeds.map((breed) => (
                          <SelectItem key={breed}>{breed}</SelectItem>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Características físicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span>📏</span>
                    Características físicas
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      label="Edad"
                      placeholder="En años"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      startContent={<span className="text-default-400">🎂</span>}
                      variant="bordered"
                      size="lg"
                    />
                    <Input
                      type="number"
                      label="Peso"
                      placeholder="En kg"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      startContent={<span className="text-default-400">⚖️</span>}
                      variant="bordered"
                      size="lg"
                    />
                    <Select
                      label="Género"
                      placeholder="Selecciona"
                      selectedKeys={formData.gender ? [formData.gender] : []}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      variant="bordered"
                      size="lg"
                    >
                      <SelectItem key="macho" startContent="♂️">Macho</SelectItem>
                      <SelectItem key="hembra" startContent="♀️">Hembra</SelectItem>
                    </Select>
                  </div>
                </div>

                <Divider />

                {/* Información adicional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span>💭</span>
                    Información adicional
                  </h3>
                  
                  <Textarea
                    label="Notas sobre tu mascota"
                    placeholder="Cuéntanos sobre la personalidad, problemas de salud, comportamiento especial, alergias, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    minRows={3}
                    maxRows={6}
                    variant="bordered"
                    size="lg"
                    className="w-full"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter className="justify-center sm:justify-end">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              variant="light" 
              onPress={onClose}
              size="lg"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit} 
              isLoading={isLoading}
              isDisabled={!formData.name || !formData.type || !formData.breed}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 order-1 sm:order-2"
            >
              {isLoading 
                ? (existingPet ? 'Actualizando...' : 'Registrando...') 
                : (existingPet ? 'Actualizar mascota' : 'Registrar mascota')
              }
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 