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
  Textarea
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
        name: existingPet.name || '',
        type: existingPet.type || '',
        breed: existingPet.breed || '',
        age: existingPet.age ? existingPet.age.toString() : '',
        weight: existingPet.weight ? existingPet.weight.toString() : '',
        gender: existingPet.gender || '',
        notes: existingPet.notes || ''
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
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        userId: 'anonymous'
      }

      let response
      let successMessage

      if (existingPet) {
        // Actualizar mascota existente
        response = await fetch(`/api/user-pets?petId=${existingPet._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(petData)
        })
        successMessage = 'Mascota actualizada exitosamente'
      } else {
        // Crear nueva mascota
        response = await fetch('/api/user-pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        alert(`Error: ${error.error}`)
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <h2 className="text-xl font-bold text-blue-600">
              {existingPet ? 'Editar mascota' : 'Registra tu mascota'}
            </h2>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Nombre de tu mascota"
              placeholder="Ej: Max, Luna, Rocky..."
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              isRequired
              startContent={<span>🏷️</span>}
            />
            
            <Select
              label="Tipo de mascota"
              placeholder="Selecciona el tipo"
              selectedKeys={formData.type ? [formData.type] : []}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              isRequired
            >
              <SelectItem key="perro" value="perro">🐕 Perro</SelectItem>
              <SelectItem key="gato" value="gato">🐱 Gato</SelectItem>
            </Select>

            {formData.type && (
              <Select
                label="Raza"
                placeholder="Selecciona la raza"
                selectedKeys={formData.breed ? [formData.breed] : []}
                onChange={(e) => setFormData({...formData, breed: e.target.value})}
                isRequired
              >
                {breeds.map((breed) => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </Select>
            )}

            <div className="flex gap-4">
              <Input
                type="number"
                label="Edad"
                placeholder="En años"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                startContent={<span>🎂</span>}
              />
              <Input
                type="number"
                label="Peso"
                placeholder="En kg"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                startContent={<span>⚖️</span>}
              />
            </div>

            <Select
              label="Género"
              placeholder="Selecciona el género"
              selectedKeys={formData.gender ? [formData.gender] : []}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <SelectItem key="macho" value="macho">♂️ Macho</SelectItem>
              <SelectItem key="hembra" value="hembra">♀️ Hembra</SelectItem>
            </Select>

            <Textarea
              label="Notas adicionales"
              placeholder="Cuéntanos sobre la personalidad, problemas de salud, comportamiento especial, etc."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              minRows={3}
            />
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit} 
            isLoading={isLoading}
            isDisabled={!formData.name || !formData.type || !formData.breed}
          >
            {existingPet ? 'Actualizar mascota' : 'Registrar mascota'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 