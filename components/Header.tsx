import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-red-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">PokéExplorer</Link>
        <ul className="flex space-x-4">
          <li><Link href="/" className="hover:underline">Search</Link></li>
          <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
        </ul>
      </nav>
    </header>
  )
}

