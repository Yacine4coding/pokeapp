import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PokemonCardProps {
  pokemon: {
    name: string;
    types: { type: { name: string } }[];
    abilities: { ability: { name: string } }[];
    base_experience: number;
    sprites: { front_default: string };
  };
  onClick: () => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-xl font-bold capitalize">{pokemon.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <Image
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            width={96}
            height={96}
          />
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Type(s): </span>
            {pokemon.types.map(type => (
              <Badge key={type.type.name} variant="secondary" className="mr-1">
                {type.type.name}
              </Badge>
            ))}
          </div>
          <div>
            <span className="font-semibold">Abilities: </span>
            {pokemon.abilities.map(ability => ability.ability.name).join(', ')}
          </div>
          <div>
            <span className="font-semibold">Base Experience: </span>
            {pokemon.base_experience}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

