'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type TemplateType = 'vintage_antique' | 'vintage_classic' | 'royal_luxury';

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

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedHeadline = localStorage.getItem('sn_headline');
    const savedSub = localStorage.getItem('sn_sub');
    const savedImg = localStorage.getItem('sn_img');
    const savedTemplate = localStorage.getItem('sn_template') as TemplateType;
    
    if (savedHeadline) setHeadline(savedHeadline);
    if (savedSub) setSubHeadline(savedSub);
    if (savedImg) setImagePreview(savedImg);
    if (savedTemplate && ['vintage_antique', 'vintage_classic', 'royal_luxury'].includes(savedTemplate)) {
      setTemplate(savedTemplate);
    }
    
    setDate(new Date().toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' }));
    return () => stopCamera();
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('sn_headline', headline);
    localStorage.setItem('sn_sub', subHeadline);
    localStorage.setItem('sn_template', template);
    if (imagePreview && imagePreview.length < 2000000) { 
      localStorage.setItem('sn_img', imagePreview);
    }
  }, [headline, subHeadline, template, imagePreview]);

  const particles = useRef<{x: number, y: number, s: number, vy: number, a: number}[]>([]);
  useEffect(() => {
    particles.current = Array.from({length: 20}, () => ({
      x: Math.random() * 1500, y: Math.random() * 2121, s: Math.random() * 5 + 2, vy: Math.random() * 2 + 1, a: Math.random()
    }));
  }, []);

  useEffect(() => {
    let animationId: number;
    const render = () => {
      drawNewspaper();
      if (isCameraActive) animationId = requestAnimationFrame(render);
    };

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        drawNewspaper();
      });
    }

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
    } catch (err) { alert('មិនអាចបើកកាមេរ៉ាបានទេ!'); }
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

    // Helper function for wrapping text within a max boundary on canvas
    const wrapText = (
      text: string,
      xPos: number,
      yPos: number,
      maxWidth: number,
      lineHeight: number,
      fontSize: number,
      fontFamily: string,
      fontWeight: string = 'normal',
      fontStyle: string = ''
    ): number => {
      const stylePrefix = fontStyle ? `${fontStyle} ` : '';
      const weightPrefix = fontWeight ? `${fontWeight} ` : '';
      ctx.font = `${stylePrefix}${weightPrefix}${fontSize}px ${fontFamily}`;

      let chunks: string[] = [];
      try {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
          const segmenter = new Intl.Segmenter('km', { granularity: 'word' });
          chunks = Array.from(segmenter.segment(text)).map(s => s.segment);
        } else {
          chunks = text.split(/(\s+)/);
        }
      } catch {
        chunks = text.split(/(\s+)/);
      }

      // Break any chunk that is individually wider than maxWidth
      const tokens: string[] = [];
      for (const chunk of chunks) {
        if (ctx.measureText(chunk).width > maxWidth) {
          const chars = Array.from(chunk);
          let currentSub = '';
          for (const char of chars) {
            if (ctx.measureText(currentSub + char).width > maxWidth && currentSub) {
              tokens.push(currentSub);
              currentSub = char;
            } else {
              currentSub += char;
            }
          }
          if (currentSub) tokens.push(currentSub);
        } else {
          tokens.push(chunk);
        }
      }

      // Build lines fitting within maxWidth
      const lines: string[] = [];
      let currentLine = '';

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const testLine = currentLine + token;
        if (ctx.measureText(testLine).width > maxWidth && currentLine.trim() !== '') {
          lines.push(currentLine.trim());
          currentLine = token;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.trim() !== '') {
        lines.push(currentLine.trim());
      }

      let currentY = yPos;
      for (const line of lines) {
        ctx.fillText(line, xPos, currentY);
        currentY += lineHeight;
      }

      return currentY - lineHeight;
    };

    // 1. BACKGROUND
    if (template === 'royal_luxury') {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#064e3b'); grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 15; ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      ctx.lineWidth = 4; ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    } else if (template === 'vintage_antique') {
      ctx.fillStyle = '#f4ece0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#dcd4c8'; ctx.lineWidth = 1;
      for (let i = 0; i < 500; i++) {
        ctx.beginPath(); const rx = Math.random() * canvas.width, ry = Math.random() * canvas.height;
        ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.random() * 20, ry + Math.random() * 5); ctx.stroke();
      }
      ctx.strokeStyle = '#2c2824'; ctx.lineWidth = 30; ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.lineWidth = 8; ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);
    } else if (template === 'vintage_classic') {
      ctx.fillStyle = '#fdfdfd'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f0f0f0'; for (let i = 0; i < canvas.height; i += 4) ctx.fillRect(0, i, canvas.width, 1);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 20; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.lineWidth = 4; ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
    }

    // Particles animation on camera active
    if (isCameraActive) {
      particles.current.forEach(p => {
        ctx.beginPath();
        if (template === 'royal_luxury') ctx.fillStyle = `rgba(251, 191, 36, ${p.a * 0.5})`;
        else ctx.fillStyle = `rgba(0, 0, 0, ${p.a * 0.1})`;
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
        p.y -= p.vy; if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
      });
    }

    // 2. HEADER
    ctx.textAlign = 'center';
    const mainColor = template === 'royal_luxury' ? '#fbbf24' : (template === 'vintage_antique' ? '#2c2824' : '#111827');
    ctx.fillStyle = mainColor;

    // Header metadata line (Refined normal weight Battambang font)
    wrapText('បង្កើតនៅឆ្នាំ ២០២៥   |   ភ្នំពេញ, កម្ពុជា   |   លេខ ៩៤ ស៊េរី ១៥២', canvas.width / 2, 160, 1200, 35, 23, 'Battambang', 'normal');
    
    if (template === 'vintage_antique') { ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(44, 40, 36, 0.3)'; }
    ctx.font = '100px Moul'; ctx.fillText('ស្ទាវ ញ៉ូស៍', canvas.width / 2, 325); ctx.shadowBlur = 0;

    wrapText(`ការបោះពុម្ពពិសេស   |   ${date}   |   តម្លៃ: ២ សេន`, canvas.width / 2, 415, 1200, 35, 25, 'Battambang', 'normal');
    ctx.strokeStyle = mainColor; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, 455); ctx.lineTo(1350, 455); ctx.stroke();

    // Stamps
    if (template === 'vintage_antique') {
      ctx.save(); ctx.translate(1250, 325); ctx.rotate(Math.PI / 10);
      ctx.strokeStyle = 'rgba(180, 40, 40, 0.7)'; ctx.lineWidth = 4; ctx.strokeRect(-85, -40, 170, 80);
      ctx.fillStyle = 'rgba(180, 40, 40, 0.7)'; ctx.font = '22px Battambang';
      ctx.fillText('បានពិនិត្យ', 0, 8); ctx.restore();
    }
    if (template === 'vintage_classic') {
      ctx.save(); ctx.translate(150, 310);
      ctx.fillStyle = '#111827'; ctx.fillRect(-55, -28, 110, 56);
      ctx.fillStyle = '#fdfdfd'; ctx.font = '20px Battambang'; ctx.fillText('VOL. 1', 0, 7); ctx.restore();
    }
    if (template === 'royal_luxury') {
      ctx.save(); ctx.translate(1250, 325);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.font = '18px Battambang'; ctx.fillText('PREMIUM', 0, 6); ctx.restore();
    }

    // 3. HEADLINE & SUBHEADLINE
    ctx.textAlign = 'center';
    const displayHeadline = headline || 'សូមបំពេញចំណងជើងធំ!';
    if (!headline) ctx.globalAlpha = 0.35;
    const headlineFontSize = displayHeadline.length > 50 ? 40 : (displayHeadline.length > 25 ? 50 : 62);
    const headlineLineHeight = headlineFontSize * 1.35;
    const lastHeadlineY = wrapText(displayHeadline, canvas.width / 2, 570, 1200, headlineLineHeight, headlineFontSize, 'Battambang', 'normal');
    ctx.globalAlpha = 1.0;

    const displaySub = subHeadline || 'សូមបំពេញចំណងជើងរងនៅទីនេះ...';
    if (!subHeadline) ctx.globalAlpha = 0.35;
    const subFontSize = 34;
    const lastSubY = wrapText(displaySub, canvas.width / 2, lastHeadlineY + 55, 1200, 48, subFontSize, 'Battambang', 'normal');
    ctx.globalAlpha = 1.0;

    // 4. PHOTO / LIVE CAMERA (Dynamically calculated position & size to prevent overlap)
    const photoY = lastSubY + 50;
    const availableSpace = Math.min(560, 1700 - photoY - 180);
    const h = Math.max(380, availableSpace);
    const w = 1000;
    const x = (canvas.width - w) / 2;
    const y = photoY;

    ctx.save();
    if (template === 'royal_luxury') ctx.fillStyle = '#064e3b';
    else ctx.fillStyle = template === 'vintage_antique' ? '#dcd4c8' : '#e5e7eb';
    
    ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
    if (template === 'vintage_classic' || template === 'royal_luxury') {
      ctx.strokeStyle = template === 'royal_luxury' ? '#fbbf24' : '#111827';
      ctx.lineWidth = 4; ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
    }
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

    const applyVintageEffect = (source: HTMLVideoElement | HTMLImageElement, dX: number, dY: number, dW: number, dH: number) => {
      if (source instanceof HTMLVideoElement) {
        ctx.translate(dX + dW, dY); ctx.scale(-1, 1);
        ctx.drawImage(source, 0, 0, dW, dH);
        ctx.scale(-1, 1); ctx.translate(-(dX + dW), -dY);
      } else {
        ctx.drawImage(source, dX, dY, dW, dH);
      }
      if (template.includes('vintage')) {
        ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'black'; ctx.fillRect(dX, dY, dW, dH); ctx.restore();
        if (template === 'vintage_classic') {
          ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(dX, dY, dW, dH); ctx.restore();
        }
        if (template === 'vintage_antique') {
          ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = 'rgba(112, 66, 20, 0.35)'; ctx.fillRect(dX, dY, dW, dH); ctx.restore();
        }
      }
    };

    if (isCameraActive && videoRef.current) {
      const video = videoRef.current;
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = w / h;
      let dW = w, dH = h, dX = x, dY = y;
      if (videoRatio > targetRatio) { dW = h * videoRatio; dX = x - (dW - w) / 2; }
      else { dH = w / videoRatio; dY = y - (dH - h) / 2; }
      applyVintageEffect(video, dX, dY, dW, dH);
    } else if (imagePreview) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const imgRatio = img.width / img.height;
          const targetRatio = w / h;
          let dW = w, dH = h, dX = x, dY = y;
          if (imgRatio > targetRatio) { dW = h * imgRatio; dX = x - (dW - w) / 2; }
          else { dH = w / imgRatio; dY = y - (dH - h) / 2; }
          applyVintageEffect(img, dX, dY, dW, dH); resolve();
        };
        img.src = imagePreview;
      });
    }
    ctx.restore();

    // Photo Caption
    ctx.textAlign = 'right';
    const captionY = y + h + 38;
    wrapText('រូបថតដោយ៖ ស្ទាវ ញ៉ូស៍', x + w, captionY, w, 28, 20, 'Battambang', 'normal', 'italic');

    // 5. QUOTE & FOOTER (Dynamically offset from photo caption)
    ctx.textAlign = 'center';
    ctx.fillStyle = mainColor;
    const quoteText = '"ព័ត៌មានដែលអានហើយញ៉ាក់សាច់ ផ្តល់ជូនលោកអ្នកនូវរាល់ព្រឹត្តិការណ៍ថ្មីៗបំផុត。"';
    const quoteY = captionY + 55;
    const lastQuoteY = wrapText(quoteText, canvas.width / 2, quoteY, 1200, 44, 30, 'Battambang', 'normal', 'italic');

    // Footer divider line & text
    const footerLineY = Math.max(1860, lastQuoteY + 45);
    ctx.strokeStyle = mainColor; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(120, footerLineY); ctx.lineTo(1380, footerLineY); ctx.stroke();
    wrapText('WWW.STEAVNEWS.SITE', canvas.width / 2, footerLineY + 95, 1200, 44, 36, 'Battambang', 'normal');
  };

  const startRecording = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    chunksRef.current = [];
    const stream = canvas.captureStream(30);
    
    // Attempt high-quality MP4 first, then fallback to WebM
    let mimeType = 'video/mp4;codecs=avc1';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 5000000 // 5Mbps for high quality
      });
      
      mediaRecorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const fileName = `SteavNews_Live_${Date.now()}.mp4`;
        const file = new File([blob], fileName, { type: "video/mp4" });

        // Native Share for mobile
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
          try {
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'កាសែតស្ទាវញ៉ូស៍',
                text: 'វីដេអូកាសែតដែលបានបង្កើតដោយ Steav News',
              });
              setIsRecording(false);
              return;
            }
          } catch (err) {}
        }

        // Fallback Link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsRecording(false);
        setTimeout(() => URL.revokeObjectURL(url), 20000);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => { 
        if (mediaRecorder.state === 'recording') mediaRecorder.stop(); 
      }, 5000);
    } catch (err) {
      alert('មិនអាចថតវីដេអូបានទេ!');
      setIsRecording(false);
    }
  };

  const downloadNewspaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('កំហុសក្នុងការទាញយក!');
          setIsGenerating(false);
          return;
        }

        const fileName = `SteavNews_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // 1. Mobile Web Share API
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
          try {
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'កាសែតស្ទាវញ៉ូស៍',
                text: 'រូបភាពកាសែតដែលបានបង្កើតដោយ Steav News',
              });
              setIsGenerating(false);
              return;
            }
          } catch (shareErr) {
            // User cancelled share modal; proceed to direct file download
          }
        }

        // 2. Direct browser download for Laptops & Mobile Browsers
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 3. Fallback for iOS Safari
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.open(url, '_blank');
        }

        setTimeout(() => setIsGenerating(false), 500);
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }, 'image/jpeg', 0.95);
    } catch (e) {
      alert('កំហុសក្នុងការទាញយក!');
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { stopCamera(); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <video ref={videoRef} autoPlay playsInline className="hidden" />
      <main className="flex-grow pt-[75px] sm:pt-[95px] pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-900 tracking-tight mb-1 sm:mb-2" style={{ fontFamily: "'Moul', serif" }}>កម្មវិធីបង្កើតគំរូកាសែត</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm" style={{ fontFamily: "'Battambang', sans-serif" }}>ជ្រើសរើសស្ទីលតាមចំណង់ចំណូលចិត្តរបស់អ្នក។</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Form Controls */}
            <div className="w-full lg:w-1/3 space-y-5 sm:space-y-6 order-2 lg:order-1">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2"><span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs sm:text-sm">1</span>ជ្រើសរើសរូបថត</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={isCameraActive ? stopCamera : startCamera} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all ${isCameraActive ? 'border-red-500 bg-red-50 text-red-500' : 'border-primary bg-primary/5 text-primary'}`}>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs font-bold" style={{ fontFamily: "'Koulen', sans-serif" }}>{isCameraActive ? 'បិទកាមេរ៉ា' : 'បើកកាមេរ៉ា'}</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 border-gray-100 hover:border-primary cursor-pointer">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-bold text-gray-500" style={{ fontFamily: "'Koulen', sans-serif" }}>បញ្ចូលរូបភាព</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="space-y-3.5 sm:space-y-4">
                  <div><label className="block text-xs font-bold text-black uppercase mb-1" style={{ fontFamily: "'Koulen', sans-serif" }}>ចំណងជើងធំ</label><input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="សូមបំពេញចំណងជើង!" className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl outline-none font-bold text-black placeholder:text-gray-400 placeholder:font-normal text-[16px]" style={{ fontFamily: "'Battambang', sans-serif" }} /></div>
                  <div><label className="block text-xs font-bold text-black uppercase mb-1" style={{ fontFamily: "'Koulen', sans-serif" }}>ចំណងជើងរង</label><textarea value={subHeadline} onChange={(e) => setSubHeadline(e.target.value)} placeholder="សូមបំពេញចំណងជើងរង!" className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl outline-none h-20 resize-none text-black placeholder:text-gray-400 placeholder:font-normal text-[16px]" style={{ fontFamily: "'Battambang', sans-serif" }} /></div>
                </div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2"><span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs sm:text-sm">2</span>ជ្រើសរើសគំរូ</h3>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button onClick={() => setTemplate('vintage_antique')} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all text-[11px] sm:text-xs font-bold ${template === 'vintage_antique' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'}`}>បុរាណ (Antique)</button>
                  <button onClick={() => setTemplate('vintage_classic')} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all text-[11px] sm:text-xs font-bold ${template === 'vintage_classic' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500'}`}>សម័យមុន (Classic)</button>
                  <button onClick={() => setTemplate('royal_luxury')} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all text-[11px] sm:text-xs font-bold col-span-2 ${template === 'royal_luxury' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-500'}`}>Royal Luxury</button>
                </div>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                <button onClick={downloadNewspaper} disabled={isGenerating} className="w-full bg-primary hover:bg-primary-dark text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base cursor-pointer" style={{ fontFamily: "'Koulen', sans-serif" }}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{isGenerating ? 'កំពុងបង្កើតរូបភាព...' : 'ទាញយកជារូបភាព (JPG)'}</button>
                <button onClick={startRecording} disabled={!isCameraActive || isRecording} className={`w-full font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-white disabled:opacity-50'}`} style={{ fontFamily: "'Koulen', sans-serif" }}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>{isRecording ? 'កំពុងថត...' : 'ទាញយកជាវីដេអូ (MP4)'}</button>
              </div>
            </div>

            {/* Newspaper Preview */}
            <div className="w-full lg:w-2/3 flex flex-col items-center order-1 lg:order-2">
              <div className="lg:sticky lg:top-[100px] w-full flex flex-col items-center max-w-[480px]">
                <div className="bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 mb-4 sm:mb-6 w-full overflow-hidden">
                  <canvas ref={canvasRef} className="w-full max-w-full h-auto rounded-xl shadow-inner bg-slate-100 block" style={{ aspectRatio: '1/1.414' }} />
                </div>
                <div className="bg-white p-3 sm:p-4 border border-gray-100 flex justify-between items-center rounded-2xl shadow-sm w-full">
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
