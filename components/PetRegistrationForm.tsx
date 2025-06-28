'use client'

import { useState } from 'react'
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
}

export default function PetRegistrationForm({ isOpen, onClose, onSuccess }: PetRegistrationFormProps) {
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

  const dogBreeds = ["Golden Retriever", "Border Collie", "Bulldog Francés", "Labrador", "Pastor Alemán", "Husky", "Beagle", "Poodle"]
  const catBreeds = ["Persa", "Maine Coon", "Siamés", "Ragdoll", "British Shorthair", "Bengalí", "Sphynx"]

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

      const response = await fetch('/api/user-pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData)
      })

      if (response.ok) {
        const result = await response.json()
        onSuccess(result.pet)
        onClose()
        setFormData({
          name: '',
          type: '',
          breed: '',
          age: '',
          weight: '',
          gender: '',
          notes: ''
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error registrando mascota:', error)
      alert('Error al registrar la mascota')
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
            <h2 className="text-xl font-bold text-blue-600">Registra tu mascota</h2>
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
            Registrar mascota
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 