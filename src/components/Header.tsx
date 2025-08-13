import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          AI Tutor Platform
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/courses" className="hover:text-gray-300">
              Courses
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/login" className="hover:text-gray-300">
              로그인
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
