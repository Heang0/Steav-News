export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Article not found</p>
          <a href="/" className="btn-primary inline-block">Go Home</a>
        </div>
      </main>
    </div>
  );
}
