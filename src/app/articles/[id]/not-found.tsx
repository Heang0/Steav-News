export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-6xl font-black text-primary mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Oops! We couldn't find that article!</h2>
        
        {/* Funny Meme GIF */}
        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 mb-8 max-w-[400px] w-full">
          <img 
            src="https://media.tenor.com/97kmzJG6PqwAAAAM/67.gif" 
            alt="67 Meme 404" 
            className="w-full h-auto object-cover"
          />
        </div>

        <p className="text-gray-500 mb-8 text-lg">The article you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        
        <a href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95">
          Take Me Back Home
        </a>
      </div>
    </div>
  );
}
