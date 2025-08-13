export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} AI 튜터 플랫폼. 모든 권리 보유.</p>
      </div>
    </footer>
  );
}
