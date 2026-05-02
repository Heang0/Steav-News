'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import html2canvas from 'html2canvas';

type TemplateType = 'vintage' | 'modern';

export default function NewspaperGenerator() {
  const [headline, setHeadline] = useState('LOCAL HERO SAVES THE DAY!');
  const [subHeadline, setSubHeadline] = useState('Remarkable story of courage and kindness inspires the nation.');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateType>('vintage');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const newspaperRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadNewspaper = async () => {
    if (!newspaperRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(newspaperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: template === 'vintage' ? '#f4ece0' : '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `steav-news-${template}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Could not save image. Try taking a screenshot!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">NEWS TEMPLATE GENERATOR</h1>
            <p className="text-gray-500 font-medium">Create your own front-page story in seconds.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">1</span>
                  Customize Content
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Headline</label>
                    <input 
                      type="text" 
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
                      placeholder="ENTER MAIN HEADLINE"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sub-Headline</label>
                    <textarea 
                      value={subHeadline}
                      onChange={(e) => setSubHeadline(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none h-20 resize-none text-sm"
                      placeholder="Enter a brief summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Upload Your Photo</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">Click to select photo</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">2</span>
                  Select Template
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTemplate('vintage')}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${template === 'vintage' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                  >
                    Vintage Daily
                  </button>
                  <button 
                    onClick={() => setTemplate('modern')}
                    className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${template === 'modern' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                  >
                    Modern Tabloid
                  </button>
                </div>
              </div>

              <button 
                onClick={downloadNewspaper}
                disabled={isGenerating || !imagePreview}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Generating...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Newspaper
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            <div className="w-full lg:w-2/3 flex flex-col items-center">
              <div className="sticky top-[100px] w-full">
                {/* TEMPLATE: VINTAGE */}
                {template === 'vintage' && (
                  <div 
                    ref={newspaperRef}
                    className="mx-auto w-full max-w-[500px] aspect-[1/1.414] bg-[#f4ece0] shadow-2xl p-8 border-[10px] border-[#e8dfd0] relative overflow-hidden text-[#2c2824]"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                  >
                    {/* Newspaper Header */}
                    <div className="border-b-4 border-[#2c2824] pb-4 mb-4 text-center">
                      <div className="flex justify-between items-end text-[10px] font-bold uppercase mb-2">
                        <span>EST. 2024</span>
                        <span>PHNOM PENH, CAMBODIA</span>
                        <span>VOL. XCIV NO. 152</span>
                      </div>
                      <h2 className="text-[60px] font-black leading-none uppercase tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
                        STEAV NEWS
                      </h2>
                      <div className="border-t-2 border-[#2c2824] mt-2 pt-1 text-[10px] font-bold uppercase flex justify-between">
                        <span>SPECIAL EDITION</span>
                        <span>{date}</span>
                        <span>PRICE: TWO CENTS</span>
                      </div>
                    </div>

                    {/* Main Headline */}
                    <div className="text-center mb-6">
                      <h3 className="text-[32px] font-black leading-[1.1] mb-2 uppercase italic tracking-tight underline decoration-1 underline-offset-4">
                        {headline || 'YOUR STORY GOES HERE'}
                      </h3>
                      <p className="text-sm font-bold italic border-b border-[#2c2824]/30 pb-2">
                        {subHeadline || 'Subheadline goes here to explain the story.'}
                      </p>
                    </div>

                    {/* Main Image */}
                    <div className="mb-4 relative">
                      <div className="w-full aspect-[4/3] bg-[#dcd4c8] border border-[#2c2824]/20 overflow-hidden">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover grayscale brightness-90 contrast-125 sepia-[0.3]" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#2c2824]/30">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] font-bold mt-1 text-right italic uppercase">Staff Photo by Steav News Correspondent</div>
                    </div>

                    {/* Columns */}
                    <div className="grid grid-cols-2 gap-6 text-[10px] leading-tight text-justify">
                      <div className="space-y-2">
                        <p><span className="text-lg font-bold float-left mr-1 -mt-1">I</span>n a shocking turn of events that has left the local community buzzing, a new headline has emerged that dominates the morning papers. Witnesses say the scene was unlike anything they had ever witnessed in the history of this great city.</p>
                        <p>Citizens gathered at the town square to catch a glimpse of the unfolding situation. "It was truly remarkable," said one local resident who wished to remain anonymous. "We haven't seen this much excitement since the new bridge was completed back in the winter of 1948."</p>
                      </div>
                      <div className="space-y-2">
                        <p>The authorities have released a statement praising the swift actions of those involved. As the sun sets on another historic day for Steav News, the implications of these findings will surely be felt for many generations to come.</p>
                        <div className="p-2 border border-[#2c2824]/20 bg-[#f0e8dc] italic text-[9px]">
                          <strong>EDITOR'S NOTE:</strong> This story is currently developing. Check our next edition for more exclusive details and photographs.
                        </div>
                      </div>
                    </div>

                    {/* Subtle Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
                  </div>
                )}

                {/* TEMPLATE: MODERN TABLOID */}
                {template === 'modern' && (
                  <div 
                    ref={newspaperRef}
                    className="mx-auto w-full max-w-[500px] aspect-[1/1.414] bg-white shadow-2xl overflow-hidden flex flex-col"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {/* Tabloid Header */}
                    <div className="bg-primary p-4 text-white flex justify-between items-center">
                      <h2 className="text-3xl font-black italic tracking-tighter">STEAV NEWS</h2>
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase opacity-80">{date}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 rounded mt-0.5">EXCLUSIVE</div>
                      </div>
                    </div>

                    <div className="flex-grow p-6 flex flex-col">
                      {/* Big Bold Headline */}
                      <h3 className="text-[44px] font-[900] leading-[0.9] text-gray-900 mb-4 tracking-tighter uppercase italic">
                        {headline || 'BREAKING NEWS ALERT!'}
                      </h3>

                      {/* Main Image Container */}
                      <div className="relative flex-grow min-h-[300px] bg-gray-100 rounded-lg overflow-hidden mb-4 border-4 border-gray-900">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Overlay Tag */}
                        <div className="absolute bottom-4 left-4 bg-primary text-white text-xs font-black px-3 py-1 rounded shadow-lg uppercase italic">
                          Breaking Coverage
                        </div>
                      </div>

                      {/* Sub-headline / Text */}
                      <div className="space-y-4">
                        <p className="text-xl font-bold text-gray-800 leading-tight">
                          {subHeadline || 'The full story is currently unfolding on our social media platforms. Join the conversation.'}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-xs text-gray-600 font-medium">
                            Our team is on the ground reporting the latest developments as they happen. Stay tuned for live updates.
                          </div>
                          <div className="bg-gray-900 text-white p-2 rounded flex items-center justify-center gap-2">
                            <span className="text-[10px] font-black uppercase italic tracking-wider animate-pulse">Live Reporting</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">www.steavnews.site</span>
                      <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20"></div>
                        <div className="w-4 h-4 rounded-full bg-primary/40"></div>
                        <div className="w-4 h-4 rounded-full bg-primary/60"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
