'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type TemplateType = 'vintage_antique' | 'vintage_classic' | 'cuttie_pink' | 'cuttie_purple';

export default function NewspaperGenerator() {
  const [headline, setHeadline] = useState('');
  const [subHeadline, setSubHeadline] = useState('');
  const [date, setDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateType>('vintage_antique');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setDate(new Date().toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' }));
    return () => stopCamera();
  }, []);

  useEffect(() => {
    let animationId: number;
    const render = () => {
      drawNewspaper();
      if (isCameraActive) {
        animationId = requestAnimationFrame(render);
      }
    };
    if (isCameraActive) render(); else drawNewspaper();
    return () => cancelAnimationFrame(animationId);
  }, [headline, subHeadline, date, imagePreview, template, isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setImagePreview(null);
      }
    } catch (err) {
      alert('មិនអាចបើកកាមេរ៉ាបានទេ!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const drawNewspaper = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1500;
    canvas.height = 2121;
    await document.fonts.ready;

    // 1. BACKGROUND & DECORATIONS
    if (template === 'vintage_antique') {
      ctx.fillStyle = '#f4ece0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#2c2824';
      ctx.lineWidth = 30; ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.lineWidth = 8; ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);
      ctx.globalAlpha = 0.04; ctx.fillStyle = '#000000';
      for (let i = 0; i < 4000; i++) ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      ctx.globalAlpha = 1.0;
    } else if (template === 'vintage_classic') {
      ctx.fillStyle = '#f9f9f9'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 20; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.lineWidth = 4; ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
    } else if (template === 'cuttie_pink') {
      ctx.fillStyle = '#fff0f3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ff85a1'; ctx.lineWidth = 40; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.fillStyle = '#ff4d6d';
      const drawHeart = (hx: number, hy: number, size: number) => {
        ctx.beginPath(); ctx.moveTo(hx, hy);
        ctx.bezierCurveTo(hx, hy - size, hx - size, hy - size, hx - size, hy);
        ctx.bezierCurveTo(hx - size, hy + size, hx, hy + size, hx, hy + size * 1.5);
        ctx.bezierCurveTo(hx, hy + size, hx + size, hy + size, hx + size, hy);
        ctx.bezierCurveTo(hx + size, hy - size, hx, hy - size, hx, hy);
        ctx.fill();
      };
      drawHeart(150, 150, 40); drawHeart(1350, 150, 40); drawHeart(150, 1971, 40); drawHeart(1350, 1971, 40);
    } else if (template === 'cuttie_purple') {
      ctx.fillStyle = '#f3e5f5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#7b1fa2'; ctx.lineWidth = 40; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.fillStyle = '#4a148c';
      const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
        let rot = Math.PI / 2 * 3, xPos = cx, yPos = cy, step = Math.PI / spikes;
        ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          xPos = cx + Math.cos(rot) * outerRadius; yPos = cy + Math.sin(rot) * outerRadius; ctx.lineTo(xPos, yPos); rot += step;
          xPos = cx + Math.cos(rot) * innerRadius; yPos = cy + Math.sin(rot) * innerRadius; ctx.lineTo(xPos, yPos); rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius); ctx.closePath(); ctx.fill();
      };
      drawStar(150, 150, 5, 50, 25); drawStar(1350, 150, 5, 50, 25); drawStar(150, 1971, 5, 50, 25); drawStar(1350, 1971, 5, 50, 25);
    }

    // 2. HEADER TEXT
    ctx.textAlign = 'center';
    if (template === 'cuttie_pink') ctx.fillStyle = '#ff4d6d';
    else if (template === 'cuttie_purple') ctx.fillStyle = '#4a148c';
    else ctx.fillStyle = template === 'vintage_antique' ? '#2c2824' : '#111827';

    ctx.font = 'bold 28px Koulen';
    ctx.fillText(`បង្កើតនៅឆ្នាំ ២០២៤   |   ភ្នំពេញ, កម្ពុជា   |   លេខ ៩៤ ស៊េរី ១៥២`, canvas.width / 2, 160);
    ctx.font = '115px Moul';
    ctx.fillText('ស្ទាវ ញ៉ូស៍', canvas.width / 2, 330);
    ctx.font = '32px Koulen';
    ctx.fillText(`ការបោះពុម្ពពិសេស   |   ${date}   |   តម្លៃ: ២ សេន`, canvas.width / 2, 420);
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(150, 465); ctx.lineTo(1350, 465); ctx.stroke();

    // 3. PHOTO / LIVE CAMERA
    const x = 250, y = 895, w = 1000, h = 600;
    ctx.save();
    if (template === 'cuttie_pink') ctx.fillStyle = '#ffc1cc';
    else if (template === 'cuttie_purple') ctx.fillStyle = '#ce93d8';
    else ctx.fillStyle = template === 'vintage_antique' ? '#dcd4c8' : '#e5e7eb';
    
    ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

    if (isCameraActive && videoRef.current) {
      const video = videoRef.current;
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = w / h;
      let dW = w, dH = h, dX = x, dY = y;
      if (videoRatio > targetRatio) { dW = h * videoRatio; dX = x - (dW - w) / 2; }
      else { dH = w / videoRatio; dY = y - (dH - h) / 2; }
      if (template === 'vintage_antique') ctx.filter = 'grayscale(100%) sepia(40%) contrast(110%)';
      else if (template === 'vintage_classic') ctx.filter = 'grayscale(100%) contrast(125%)';
      ctx.translate(dX + dW, dY); ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, dW, dH);
    } else if (imagePreview) {
      const img = new Image(); img.src = imagePreview;
      if (img.complete) {
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let dW = w, dH = h, dX = x, dY = y;
        if (imgRatio > targetRatio) { dW = h * imgRatio; dX = x - (dW - w) / 2; }
        else { dH = w / imgRatio; dY = y - (dH - h) / 2; }
        if (template === 'vintage_antique') ctx.filter = 'grayscale(100%) sepia(40%) contrast(110%)';
        else if (template === 'vintage_classic') ctx.filter = 'grayscale(100%) contrast(125%)';
        ctx.drawImage(img, dX, dY, dW, dH);
      }
    }
    ctx.restore();

    ctx.textAlign = 'right'; ctx.font = 'italic bold 22px Koulen';
    ctx.fillText('រូបថតដោយ៖ ស្ទាវ ញ៉ូស៍', x + w, y + h + 45);

    // 4. HEADLINE & TEXT
    const wrapText = (text: string, xPos: number, yPos: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' '); let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, xPos, yPos); line = words[n] + ' '; yPos += lineHeight;
        } else line = testLine;
      }
      ctx.fillText(line, xPos, yPos); return yPos;
    };

    ctx.textAlign = 'center';
    const displayHeadline = headline || 'សូមបំពេញចំណងជើងធំ!';
    if (!headline) ctx.globalAlpha = 0.3;
    ctx.font = displayHeadline.length > 50 ? '62px Moul' : '82px Moul';
    const lastY = wrapText(displayHeadline, canvas.width / 2, 655, 1100, 110);
    ctx.globalAlpha = 1.0;

    const displaySub = subHeadline || 'សូមបំពេញចំណងជើងរងនៅទីនេះ...';
    if (!subHeadline) ctx.globalAlpha = 0.3;
    ctx.font = '38px Koulen';
    ctx.fillText(displaySub, canvas.width / 2, lastY + 90);
    ctx.globalAlpha = 1.0;
    
    ctx.font = 'italic 42px Battambang';
    ctx.fillText('"ព័ត៌មានដែលអានហើយញ៉ាក់សាច់ ផ្តល់ជូនលោកអ្នកនូវរាល់ព្រឹត្តិការណ៍ថ្មីៗបំផុត។"', canvas.width / 2, 1780);

    // 5. FOOTER
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(100, 1850); ctx.lineTo(1400, 1850); ctx.stroke();
    ctx.font = 'bold 50px Koulen'; ctx.fillText('WWW.STEAVNEWS.SITE', canvas.width / 2, 1980);
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    chunksRef.current = [];
    const stream = canvas.captureStream(30);
    
    // Choose compatible format for mobile (MP4 for iOS, WebM for Android)
    let mimeType = 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
    else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorder.onstop = () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `steav-news-live-${Date.now()}.${ext}`; link.click();
      setIsRecording(false);
    };
    mediaRecorder.start(); mediaRecorderRef.current = mediaRecorder; setIsRecording(true);
    setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 5000);
  };

  const downloadNewspaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    try {
      const link = document.createElement('a');
      link.download = `steav-news-${template}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
    } catch (e) { alert('កំហុសក្នុងការទាញយក!'); } finally { setIsGenerating(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { stopCamera(); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <video ref={videoRef} autoPlay playsInline className="hidden" />
      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-normal text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Moul', serif" }}>កម្មវិធីបង្កើតគំរូកាសែត</h1>
            <p className="text-gray-500 font-medium text-sm" style={{ fontFamily: "'Battambang', sans-serif" }}>ជ្រើសរើសស្ទីលតាមចំណង់ចំណូលចិត្តរបស់អ្នក។</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">1</span>ជ្រើសរើសរូបថត</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={isCameraActive ? stopCamera : startCamera} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isCameraActive ? 'border-red-500 bg-red-50 text-red-500' : 'border-primary bg-primary/5 text-primary'}`}>
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs font-bold" style={{ fontFamily: "'Koulen', sans-serif" }}>{isCameraActive ? 'បិទកាមេរ៉ា' : 'បើកកាមេរ៉ា'}</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-100 hover:border-primary cursor-pointer">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-bold text-gray-500" style={{ fontFamily: "'Koulen', sans-serif" }}>បញ្ចូលរូបភាព</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-black uppercase mb-1" style={{ fontFamily: "'Koulen', sans-serif" }}>ចំណងជើងធំ</label><input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="សូមបំពេញចំណងជើង!" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none font-bold text-black placeholder:text-gray-400 placeholder:font-normal" style={{ fontFamily: "'Battambang', sans-serif" }} /></div>
                  <div><label className="block text-xs font-bold text-black uppercase mb-1" style={{ fontFamily: "'Koulen', sans-serif" }}>ចំណងជើងរង</label><textarea value={subHeadline} onChange={(e) => setSubHeadline(e.target.value)} placeholder="សូមបំពេញចំណងជើងរង!" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none h-20 resize-none text-sm text-black placeholder:text-gray-400 placeholder:font-normal" style={{ fontFamily: "'Battambang', sans-serif" }} /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">2</span>ជ្រើសរើសគំរូ</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTemplate('vintage_antique')} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold ${template === 'vintage_antique' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'}`}>បុរាណ (Antique)</button>
                  <button onClick={() => setTemplate('vintage_classic')} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold ${template === 'vintage_classic' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'}`}>សម័យមុន (Classic)</button>
                  <button onClick={() => setTemplate('cuttie_pink')} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold ${template === 'cuttie_pink' ? 'border-[#ff85a1] bg-[#fff0f3] text-[#ff4d6d]' : 'border-gray-100 text-gray-500'}`}>Cuttie Pink (HK)</button>
                  <button onClick={() => setTemplate('cuttie_purple')} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold ${template === 'cuttie_purple' ? 'border-[#7b1fa2] bg-[#f3e5f5] text-[#4a148c]' : 'border-gray-100 text-gray-500'}`}>Cuttie Purple (KM)</button>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={downloadNewspaper} disabled={isGenerating || (!imagePreview && !isCameraActive)} className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontFamily: "'Koulen', sans-serif" }}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>ទាញយកជារូបភាព (JPG)</button>
                <button onClick={startRecording} disabled={!isCameraActive || isRecording} className={`w-full font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-white'}`} style={{ fontFamily: "'Koulen', sans-serif" }}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>{isRecording ? 'កំពុងថត...' : 'ទាញយកជាវីដេអូ (Mobile OK)'}</button>
              </div>
            </div>
            <div className="w-full lg:w-2/3 flex flex-col items-center">
              <div className="sticky top-[100px] w-full flex flex-col items-center">
                <div className="bg-white p-4 rounded-3xl shadow-2xl border border-gray-100 mb-6 max-w-[500px] w-full">
                  <canvas ref={canvasRef} className="w-full h-auto rounded-xl shadow-inner bg-slate-100" style={{ aspectRatio: '1/1.414' }} />
                </div>
                <div className="bg-white p-4 border border-gray-100 flex justify-between items-center rounded-2xl shadow-sm w-full max-w-[500px]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Koulen', sans-serif" }}>{isCameraActive ? 'LIVE PREVIEW' : 'STILL PREVIEW'}</span>
                  <div className="flex gap-2 items-center"><div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div><span className={`text-[9px] font-bold uppercase ${isCameraActive ? 'text-red-500' : 'text-green-500'}`}>{isCameraActive ? 'Live' : 'Ready'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
