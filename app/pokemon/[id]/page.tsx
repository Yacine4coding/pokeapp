import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function getPokemonData(id: string) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}

async function getRelatedPokemon(types: string[]) {
  const relatedPokemon = await Promise.all(types.map(async (type) => {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
    const data = await res.json()
    return data.pokemon.slice(0, 5).map((p: any) => p.pokemon.name)
  }))
  return Array.from(new Set(relatedPokemon.flat()))
}

export default async function PokemonDetail({ params }: { params: { id: string } }) {
  try {
    const pokemon = await getPokemonData(params.id)
    const relatedPokemon = await getRelatedPokemon(pokemon.types.map((t: any) => t.type.name))

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center capitalize">{pokemon.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <Image src={pokemon.sprites.front_default} alt={pokemon.name} width={200} height={200} />
              <Image src={pokemon.sprites.back_default} alt={`${pokemon.name} back`} width={200} height={200} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Types:</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type: any) => (
                    <Badge key={type.type.name} variant="secondary">{type.type.name}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Abilities:</h3>
                <ul className="list-disc list-inside">
                  {pokemon.abilities.map((ability: any) => (
                    <li key={ability.ability.name}>{ability.ability.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Base Experience:</h3>
                <p>{pokemon.base_experience}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Height and Weight:</h3>
                <p>Height: {pokemon.height / 10} m</p>
                <p>Weight: {pokemon.weight / 10} kg</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Related Pokémon:</h3>
              <ul className="list-disc list-inside">
                {relatedPokemon.map((name: string) => (
                  <li key={name}>
                    <Link href={`/pokemon/${name}`} className="text-blue-500 hover:underline capitalize">
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

