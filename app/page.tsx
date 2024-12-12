"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import PokemonCard from '@/components/PokemonCard'

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonDetails {
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  base_experience: number;
  sprites: { front_default: string };
}

export default function SearchPage() {
  const [search, setSearch] = useState('')
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [pokemonDetails, setPokemonDetails] = useState<{ [key: string]: PokemonDetails }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
        if (!response.ok) {
          throw new Error('Failed to fetch Pokémon list')
        }
        const data = await response.json()
        setPokemonList(data.results)
      } catch (err) {
        setError('Failed to load Pokémon list. Please try again later.')
      }
    }

    fetchAllPokemon()
  }, [])

  useEffect(() => {
    const filterPokemon = () => {
      const filtered = pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredPokemon(filtered.slice(0, 20))
    }

    filterPokemon()
  }, [search, pokemonList])

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      setLoading(true)
      const details: { [key: string]: PokemonDetails } = {}
      for (const pokemon of filteredPokemon) {
        if (!pokemonDetails[pokemon.name]) {
          try {
            const response = await fetch(pokemon.url)
            if (!response.ok) {
              throw new Error(`Failed to fetch details for ${pokemon.name}`)
            }
            const data = await response.json()
            details[pokemon.name] = data
          } catch (err) {
            console.error(`Error fetching details for ${pokemon.name}:`, err)
          }
        } else {
          details[pokemon.name] = pokemonDetails[pokemon.name]
        }
      }
      setPokemonDetails(prevDetails => ({ ...prevDetails, ...details }))
      setLoading(false)
    }

    if (filteredPokemon.length > 0) {
      fetchPokemonDetails()
    }
  }, [filteredPokemon])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setError('')
  }

  const handleCardClick = (pokemonName: string) => {
    router.push(`/pokemon/${pokemonName.toLowerCase()}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Pokémon</h1>
      <Input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Enter Pokémon name"
        className="w-full mb-6"
      />
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && <p className="text-center">Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPokemon.map(pokemon => (
          pokemonDetails[pokemon.name] && (
            <PokemonCard
              key={pokemon.name}
              pokemon={pokemonDetails[pokemon.name]}
              onClick={() => handleCardClick(pokemon.name)}
            />
          )
        ))}
      </div>
    </div>
  )
}

