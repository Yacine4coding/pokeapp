import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">Oops! The Pokémon you're looking for has fled.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to the Pokédex
      </Link>
    </div>
  )
}

