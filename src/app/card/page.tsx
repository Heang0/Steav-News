'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import html2canvas from 'html2canvas';

// ── helpers ────────────────────────────────────────────────────────────────────

function autoValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function autoValidUntilRaw(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function todayDisplay(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

/** Code-39 SVG barcode – every character uniquely encodes to real bar widths */
function DynamicBarcode({ id }: { id: string }) {
  const code39: Record<string, string> = {
    '0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101',
    '4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011',
    '8':'110100101101','9':'101100101101','A':'110101001011','B':'101101001011',
    'C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101',
    'G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101',
    'K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011',
    'O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001',
    'S':'101101011001','T':'101011011001','U':'110010101011','V':'100110101011',
    'W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101',
    '-':'100101011011','*':'100101101101',
  };
  const str = `*${id.toUpperCase()}*`;
  let pattern = '';
  for (const ch of str) { pattern += (code39[ch] ?? code39['-']) + '0'; }
  const W = pattern.length;
  const H = 28;
  const rects: React.ReactNode[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      rects.push(<rect key={i} x={i} y={0} width={1} height={H} fill="#111" />);
    }
  }
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {rects}
    </svg>
  );
}

// ── component ──────────────────────────────────────────────────────────────────

export default function IdGeneratorPage() {
  const validUntilFixed = autoValidUntilRaw();
  const validUntilDisplay = autoValidUntil();
  const issuedDisplay = todayDisplay();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    photo: '',
    dob: '',
    department: '',
  });

  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedStaff, setGeneratedStaff] = useState<any>(null);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [nextStaffId, setNextStaffId] = useState('SN-001');

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef  = useRef<HTMLDivElement>(null);

  // Pre-fetch staff count to show the forthcoming ID
  useEffect(() => {
    fetch('/api/staff')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setNextStaffId(`SN-${String(d.data.length + 1).padStart(3, '0')}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) { alert('Name and Role are required.'); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('role', formData.role);
      fd.append('phone', formData.phone);
      fd.append('photo', formData.photo);
      fd.append('dob', formData.dob);
      fd.append('validUntil', validUntilFixed);
      if (imageFile) fd.append('image', imageFile);

      const res  = await fetch('/api/staff', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setGeneratedStaff(data.data);
      } else {
        alert('Failed to generate card: ' + data.message);
      }
    } catch {
      alert('An error occurred while generating the card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (side: 'front' | 'back') => {
    const ref = side === 'front' ? frontRef : backRef;
    if (!ref.current) return;

    // CR80 card screen dimensions: 3.375in × 2.125in at 96 dpi
    const W = Math.round(3.375 * 96); // 324 px
    const H = Math.round(2.125 * 96); // 204 px

    // ── Clone the card face completely OUT of the 3-D flip context ──────────
    // html2canvas cannot correctly capture elements inside perspective/rotateY
    // containers. We clone the element, strip all 3D transforms, and position
    // it off-screen in a plain wrapper before capturing.
    const clone = ref.current.cloneNode(true) as HTMLElement;

    // Reset EVERY transform and backface property so it renders flat
    clone.style.position            = 'relative';
    clone.style.width               = `${W}px`;
    clone.style.height              = `${H}px`;
    clone.style.transform           = 'none';
    clone.style.webkitTransform     = 'none';
    clone.style.backfaceVisibility  = 'visible';
    (clone.style as any).webkitBackfaceVisibility = 'visible';
    clone.style.borderRadius        = '14px';
    clone.style.overflow            = 'hidden';
    clone.style.boxShadow           = 'none';

    // Off-screen flat wrapper — no perspective, no transforms
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      `position:fixed;top:-9999px;left:-9999px;width:${W}px;height:${H}px;` +
      `overflow:hidden;z-index:-9999;pointer-events:none;`;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Give browser a frame to paint the clone
    await new Promise(r => setTimeout(r, 160));

    try {
      const canvas = await html2canvas(clone, {
        scale: 3,            // 3× = ~300 dpi – sharp enough for PVC printing
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
        logging: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `STEAV-NEWS-ID-${side.toUpperCase()}.png`;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Download failed. Try using Print → Save as PDF instead.');
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  const activeId   = generatedStaff?.staffId   ?? nextStaffId;
  const activeName = generatedStaff?.name       ?? formData.name       ?? 'STAFF NAME';
  const activeRole = generatedStaff?.role       ?? formData.role       ?? 'POSITION';
  const activeDob  = generatedStaff?.dob        ?? formData.dob        ?? '';
  const activePhone= generatedStaff?.phone      ?? formData.phone      ?? '';
  const activeDept = generatedStaff?.department ?? formData.department ?? '';
  const activePhoto= imagePreview ?? generatedStaff?.photo ?? formData.photo ?? '';
  const verifyUrl  = generatedStaff
    ? `https://steavnews.site/staff/${generatedStaff.publicId}`
    : 'https://steavnews.site';

  // Card dimensions — standard CR80 landscape: 3.375in × 2.125in
  const CARD_W = '3.375in';
  const CARD_H = '2.125in';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#fafafa 60%,#fff5f5 100%)' }}>
      <Header />

      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Official Credential System</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              STEAV <span className="text-primary">NEWS</span>
            </h1>
            <p className="text-gray-400 font-medium mt-1 text-sm">Staff ID Card Generator</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── FORM ──────────────────────────────────────────────────────── */}
            <div className="w-full lg:w-[320px] flex-shrink-0 no-print">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4">
                  <h2 className="text-white font-bold text-sm uppercase tracking-widest">Staff Details</h2>
                </div>
                <div className="p-5">
                  {/* Auto ID badge */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 mb-5 border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Staff ID</p>
                      <p className="text-sm font-black text-gray-800 font-mono">{generatedStaff?.staffId ?? `${nextStaffId}`}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Auto
                    </span>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-3.5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="e.g. Sokha Chan" />
                    </div>
                    {/* Role */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role / Position *</label>
                      <input name="role" value={formData.role} onChange={handleInputChange} required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="e.g. Senior Reporter" />
                    </div>
                    {/* Department */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                      <input name="department" value={formData.department} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="e.g. News & Editorial" />
                    </div>
                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="+855 12 345 678" />
                    </div>

                    {/* Valid Until – read-only */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Valid Until
                        <span className="ml-2 text-[9px] bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-1.5 py-0.5 font-bold normal-case">Auto · 1 year</span>
                      </label>
                      <div className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500 font-mono font-bold select-none cursor-not-allowed">
                        {validUntilDisplay}
                      </div>
                    </div>

                    {/* Photo upload */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profile Photo</label>
                      <div className="flex gap-3 items-start">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center hover:border-primary transition-colors bg-gray-50">
                            <svg className="mx-auto h-6 w-6 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-[10px] text-gray-400 font-semibold">Upload photo</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        {imagePreview && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600">×</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="text-[10px] text-gray-300 font-bold">OR URL</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                      </div>
                      <input name="photo" value={formData.photo} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="Paste image URL" />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2 text-sm mt-1">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : 'Generate Official ID'}
                    </button>
                  </form>

                  {/* Download / Print */}
                  {generatedStaff && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleDownload('front')}
                          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Save Front
                        </button>
                        <button onClick={() => handleDownload('back')}
                          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Save Back
                        </button>
                      </div>
                      <button onClick={() => window.print()}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold py-2.5 rounded-xl transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print / Save PDF
                      </button>
                      <p className="text-[10px] text-center text-gray-400">Tip: Print on CR80 PVC card (85.6 × 54mm)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARD PREVIEW ──────────────────────────────────────────────── */}
            <div className="flex-grow flex flex-col items-center gap-6 print-section">
              {/* Controls */}
              <div className="no-print flex items-center gap-3">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">Live Preview</span>
                <button onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Flip to {isFlipped ? 'Front' : 'Back'}
                </button>
              </div>

              {/* 3-D flip wrapper — CR80 landscape */}
              <div
                className="relative cursor-pointer"
                style={{ width: CARD_W, height: CARD_H, perspective: '900px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className="w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >

                  {/* ═══════════════ CARD FRONT ═══════════════ */}
                  <div
                    ref={frontRef}
                    className="absolute inset-0 rounded-[14px] overflow-hidden shadow-2xl flex"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: '#ffffff',
                    }}
                  >
                    {/* Left colour bar + photo column */}
                    <div className="relative flex-shrink-0 flex flex-col items-center justify-between py-4 px-3"
                      style={{ width: '1.05in', background: 'linear-gradient(180deg,#0f1117 0%,#1a1c28 60%,#0f1117 100%)' }}>

                      {/* Subtle grid overlay */}
                      <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '8px 8px' }} />

                      {/* Org logo / name */}
                      <div className="relative z-10 text-center">
                        <div className="text-white font-black text-[11px] tracking-tight leading-none">STEAV</div>
                        <div className="text-primary font-black text-[11px] tracking-tight leading-none">NEWS</div>
                      </div>

                      {/* Photo */}
                      <div className="relative z-10 w-[72px] h-[88px] rounded-[6px] overflow-hidden border-2 border-white/20 shadow-lg bg-gray-700 flex items-center justify-center">
                        {activePhoto ? (
                          <Image src={activePhoto} alt="Staff" width={72} height={88} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <svg className="w-9 h-9 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        {/* Passport-style corner marks */}
                        <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-primary/60"></div>
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-primary/60"></div>
                        <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-primary/60"></div>
                        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-primary/60"></div>
                      </div>

                      {/* Gold chip */}
                      <div className="relative z-10 w-8 h-6 rounded-[3px] flex flex-wrap gap-[1.5px] p-[3px] shadow-sm overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#ffd700,#e5c100,#b39600)' }}>
                        <div className="w-[8px] h-[4px] border border-black/15 rounded-[1px]"></div>
                        <div className="w-[8px] h-[4px] border border-black/15 rounded-[1px]"></div>
                        <div className="w-[8px] h-[4px] border border-black/15 rounded-[1px]"></div>
                        <div className="w-[8px] h-[4px] border border-black/15 rounded-[1px]"></div>
                      </div>

                      {/* Red accent line at bottom of side bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary"></div>
                    </div>

                    {/* Right info column */}
                    <div className="flex-1 flex flex-col justify-between py-3 px-4 relative overflow-hidden">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <span className="text-[60px] font-black text-gray-100/40 rotate-[-20deg] tracking-widest uppercase">SN</span>
                      </div>

                      {/* Top: org title + PRESS PASS badge */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[7px] text-gray-400 font-extrabold uppercase tracking-[0.2em]">STEAV NEWS MEDIA</p>
                            <p className="text-[7px] text-gray-400 font-bold">Phnom Penh, Cambodia</p>
                          </div>
                          <div className="bg-primary text-white text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                            PRESS PASS
                          </div>
                        </div>
                        {/* Divider line */}
                        <div className="w-full h-[0.5px] bg-gray-200 mt-2"></div>
                      </div>

                      {/* Middle: name + role */}
                      <div className="relative z-10 mt-1">
                        <p className="text-[17px] font-black text-gray-900 leading-tight uppercase tracking-tight truncate">
                          {activeName}
                        </p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] truncate mt-0.5">
                          {activeRole}
                        </p>
                        {activeDept && (
                          <p className="text-[8px] text-gray-400 font-semibold mt-0.5 truncate">{activeDept}</p>
                        )}
                      </div>

                      {/* Fields grid */}
                      <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <div>
                          <p className="text-[6.5px] text-gray-400 font-extrabold uppercase tracking-wider">Staff ID</p>
                          <p className="text-[9px] font-black text-gray-800 font-mono">{activeId}</p>
                        </div>
                        <div>
                          <p className="text-[6.5px] text-gray-400 font-extrabold uppercase tracking-wider">Date of Birth</p>
                          <p className="text-[9px] font-bold text-gray-700">{activeDob || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[6.5px] text-gray-400 font-extrabold uppercase tracking-wider">Issue Date</p>
                          <p className="text-[9px] font-bold text-gray-700">{issuedDisplay}</p>
                        </div>
                        <div>
                          <p className="text-[6.5px] text-gray-400 font-extrabold uppercase tracking-wider">Valid Until</p>
                          <p className="text-[9px] font-black text-primary">{validUntilDisplay}</p>
                        </div>
                      </div>

                      {/* Bottom: barcode */}
                      <div className="relative z-10">
                        <div className="w-full h-[28px]">
                          <DynamicBarcode id={activeId} />
                        </div>
                        <p className="text-[6px] text-gray-400 font-mono tracking-[0.15em] mt-0.5">{activeId}</p>
                      </div>
                    </div>

                    {/* Top red stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-dark to-primary"></div>
                  </div>

                  {/* ═══════════════ CARD BACK ═══════════════ */}
                  <div
                    ref={backRef}
                    className="absolute inset-0 rounded-[14px] overflow-hidden shadow-2xl flex flex-col justify-between"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg,#0f1117 0%,#1a1c28 100%)',
                    }}
                  >
                    {/* Magnetic stripe */}
                    <div className="w-full h-[30px] mt-4" style={{ background: 'linear-gradient(180deg,#1a1a1a 0%,#2a2a2a 50%,#111 100%)' }}></div>

                    {/* Content area */}
                    <div className="flex-1 flex items-center gap-4 px-5 py-3">
                      {/* QR Code */}
                      <div className="flex-shrink-0 relative p-2 bg-white rounded-lg shadow-md">
                        <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
                        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-primary"></div>
                        <QRCodeSVG value={verifyUrl} size={72} level="H" includeMargin={false} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col gap-2">
                        {/* Name tag */}
                        <div className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5">
                          <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Cardholder</p>
                          <p className="text-[11px] font-black text-white uppercase truncate">{activeName}</p>
                          <p className="text-[8px] text-primary font-bold uppercase truncate">{activeRole}</p>
                        </div>

                        {/* Validity row */}
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                            <p className="text-[6px] text-gray-500 font-bold uppercase tracking-widest">Issued</p>
                            <p className="text-[8px] font-bold text-white">{issuedDisplay}</p>
                          </div>
                          <div className="flex-1 bg-primary/10 border border-primary/20 rounded-md px-2 py-1">
                            <p className="text-[6px] text-primary font-bold uppercase tracking-widest">Expires</p>
                            <p className="text-[8px] font-black text-primary">{validUntilDisplay}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        {activePhone && (
                          <p className="text-[8px] text-gray-500 font-mono">{activePhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Signature strip */}
                    <div className="mx-5 mb-3">
                      <div className="bg-white/90 rounded h-[18px] flex items-center px-2 justify-between">
                        <span className="text-[6.5px] text-gray-400 font-bold uppercase tracking-widest">Authorized Signature</span>
                        <span className="text-[10px] text-gray-700 font-bold italic" style={{ fontFamily: 'cursive' }}>
                          {activeName.split(' ')[0] || 'Signature'}
                        </span>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="px-5 pb-3 border-t border-white/10 pt-2">
                      <p className="text-[6.5px] text-gray-600 leading-relaxed">
                        This card is the property of STEAV NEWS. If found, please return to HQ, Phnom Penh, Cambodia.
                        Non-transferable. Must be visibly worn at all press events. Scan QR to verify.
                      </p>
                    </div>

                    {/* Holographic circle + bottom strip */}
                    <div className="absolute bottom-3 right-4">
                      <div className="w-7 h-7 rounded-full holo-gradient border border-white/20 shadow-inner flex items-center justify-center">
                        <span className="text-[5px] font-black text-white/90 select-none">SECURE</span>
                      </div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-dark to-primary"></div>
                  </div>

                </div>
              </div>

              <p className="no-print text-xs text-gray-400 text-center">Click card to flip • Standard CR80 (85.6 × 54 mm)</p>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes holo-shimmer {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .holo-gradient {
          background: linear-gradient(135deg,#00f2fe 0%,#4facfe 20%,#f093fb 40%,#f5576c 60%,#ffd700 80%,#00f2fe 100%);
          background-size: 300% 300%;
          animation: holo-shimmer 5s ease infinite;
        }
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .no-print { display: none !important; }
          .print-section {
            position: absolute; left: 0; top: 0; width: 100%;
            display: flex; flex-direction: row !important;
            justify-content: space-around !important;
            align-items: center !important; gap: 20px !important;
          }
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}} />
    </div>
  );
}
