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
function DynamicBarcode({ id, height = 28 }: { id: string; height?: number }) {
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
  const rects: React.ReactNode[] = [];
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      rects.push(<rect key={i} x={i} y={0} width={1} height={height} fill="#111" />);
    }
  }
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ height: `${height}px`, maxHeight: `${height}px`, display: 'block' }}>
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
    const elementId = side === 'front' ? 'export-card-front' : 'export-card-back';
    const targetElement = document.getElementById(elementId);
    if (!targetElement) return;

    try {
      // Scale: 2 of 638px x 1012px = 1276px x 2024px Ultra-HD Vertical PNG!
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const fileName = `STEAV-NEWS-ID-${side.toUpperCase()}_${Date.now()}.png`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('កំហុសក្នុងការទាញយកកាត!');
    }
  };

  const activeId   = generatedStaff?.staffId   ?? nextStaffId;
  const activeName = generatedStaff?.name       ?? formData.name       ?? 'ឈ្មោះបុគ្គលិក';
  const activeRole = generatedStaff?.role       ?? formData.role       ?? 'តួនាទី / មុខតំណែង';
  const activeDob  = generatedStaff?.dob        ?? formData.dob        ?? '';
  const activePhone= generatedStaff?.phone      ?? formData.phone      ?? '';
  const activeDept = generatedStaff?.department ?? formData.department ?? '';
  const activePhoto= imagePreview ?? generatedStaff?.photo ?? formData.photo ?? '';
  const verifyUrl  = generatedStaff
    ? `https://steavnews.site/staff/${generatedStaff.publicId}`
    : 'https://steavnews.site';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{ fontFamily: "'Battambang', sans-serif" }}>ប្រព័ន្ធបង្កើតកាតបុគ្គលិកផ្លូវការ</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              STEAV <span className="text-primary">NEWS</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1 text-sm sm:text-base" style={{ fontFamily: "'Battambang', sans-serif" }}>កម្មវិធីបង្កើតកាតសម្គាល់ខ្លួនបុគ្គលិក (Vertical Lanyard Pass)</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── FORM CONTROLS ──────────────────────────────────────────────── */}
            <div className="w-full lg:w-[340px] flex-shrink-0 no-print">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 via-primary to-red-700 px-5 py-4">
                  <h2 className="text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Battambang', sans-serif" }}>ព័ត៌មានបុគ្គលិក</h2>
                </div>
                <div className="p-5">
                  {/* Auto ID badge */}
                  <div className="flex items-center justify-between bg-red-50/50 rounded-xl px-3 py-2.5 mb-5 border border-red-100">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider" style={{ fontFamily: "'Battambang', sans-serif" }}>អត្តលេខបុគ្គលិក (Staff ID)</p>
                      <p className="text-sm font-black text-primary font-mono">{generatedStaff?.staffId ?? `${nextStaffId}`}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1 uppercase tracking-wide" style={{ fontFamily: "'Battambang', sans-serif" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>ស្វ័យប្រវត្តិ
                    </span>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-3.5" style={{ fontFamily: "'Battambang', sans-serif" }}>
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">គោត្តនាម និង នាម *</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-gray-900"
                        style={{ fontFamily: "'Battambang', sans-serif" }}
                        placeholder="ឧ. ចាន់ សុខា" />
                    </div>
                    {/* Role */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">តួនាទី / មុខតំណែង *</label>
                      <input name="role" value={formData.role} onChange={handleInputChange} required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-gray-900"
                        style={{ fontFamily: "'Battambang', sans-serif" }}
                        placeholder="ឧ. អ្នកយកព័ត៌មានជាន់ខ្ពស់" />
                    </div>
                    {/* Department */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">ផ្នែក / នាយកដ្ឋាន</label>
                      <input name="department" value={formData.department} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-gray-900"
                        style={{ fontFamily: "'Battambang', sans-serif" }}
                        placeholder="ឧ. ផ្នែកព័ត៌មាន និងនិពន្ធ" />
                    </div>
                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">ថ្ងៃ ខែ ឆ្នាំកំណើត</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900"
                        style={{ fontFamily: "'Battambang', sans-serif" }} />
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">លេខទូរស័ព្ទ</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900"
                        style={{ fontFamily: "'Battambang', sans-serif" }}
                        placeholder="+855 12 345 678" />
                    </div>

                    {/* Valid Until – read-only */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        សុពលភាពដល់
                        <span className="ml-2 text-[9px] bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-1.5 py-0.5 font-bold normal-case">ស្វ័យប្រវត្តិ · ១ ឆ្នាំ</span>
                      </label>
                      <div className="w-full px-3 py-2 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-500 font-mono font-bold select-none cursor-not-allowed">
                        {validUntilDisplay}
                      </div>
                    </div>

                    {/* Photo upload */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">រូបថតផ្ទាល់ខ្លួន</label>
                      <div className="flex gap-3 items-start">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-primary transition-colors bg-gray-50">
                            <svg className="mx-auto h-6 w-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-[11px] text-gray-600 font-semibold" style={{ fontFamily: "'Battambang', sans-serif" }}>បញ្ចូលរូបភាព</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        {imagePreview && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600">×</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="text-[10px] text-gray-400 font-bold">ឬ លីង (URL)</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                      </div>
                      <input name="photo" value={formData.photo} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800"
                        style={{ fontFamily: "'Battambang', sans-serif" }}
                        placeholder="បិទភ្ជាប់ URL រូបភាព" />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2 text-sm sm:text-base mt-3 shadow-md cursor-pointer"
                      style={{ fontFamily: "'Battambang', sans-serif" }}>
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          កំពុងបង្កើតកាត...
                        </>
                      ) : 'បង្កើតកាតសម្គាល់ខ្លួន'}
                    </button>
                  </form>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5" style={{ fontFamily: "'Battambang', sans-serif" }}>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleDownload('front')}
                        className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        រក្សាទុកខាងមុខ
                      </button>
                      <button onClick={() => handleDownload('back')}
                        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        រក្សាទុកខាងខ្នង
                      </button>
                    </div>
                    <button onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      បោះពុម្ព / រក្សាទុកជា PDF
                    </button>
                    <p className="text-[10px] text-center text-gray-400">ចំណាំ៖ បោះពុម្ពលើកាត PVC ទំហំ CR80 Vertical (54 × 85.6mm)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD LIVE PREVIEW (Full Red Brand Vertical Portrait CR80 - No Yellow) ──── */}
            <div className="flex-grow flex flex-col items-center gap-6 w-full print-section">
              {/* Controls */}
              <div className="no-print flex items-center gap-3" style={{ fontFamily: "'Battambang', sans-serif" }}>
                <span className="bg-red-50 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-red-100">មើលគំរូកាត (Vertical)</span>
                <button onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-sm cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isFlipped ? 'បង្វិលទៅខាងមុខ' : 'បង្វិលទៅខាងខ្នង'}
                </button>
              </div>

              {/* 3D Flip Wrapper — Full Main Red Vertical Portrait CR80 (54mm x 85.6mm) */}
              <div
                className="w-full max-w-[340px] aspect-[54/85.6] relative cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className="w-full h-full transition-transform duration-700 ease-in-out relative rounded-2xl overflow-hidden shadow-2xl"
                  style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >

                  {/* ═══════════════ LIVE FRONT CARD (Vertical Portrait - No Yellow) ═══════════════ */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'linear-gradient(180deg, #b80000 0%, #e60000 50%, #990000 100%)',
                      fontFamily: "'Battambang', sans-serif",
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      color: '#ffffff',
                    }}
                  >
                    {/* Top Lanyard Slot & Brand Header */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="w-12 h-2.5 bg-black/40 rounded-full border border-white/30"></div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-black text-sm text-white tracking-wider">STEAV</span>
                        <span className="font-black text-sm text-slate-100 tracking-wider">NEWS</span>
                      </div>
                      <div className="bg-white text-red-700 text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm" style={{ fontFamily: "'Koulen', sans-serif" }}>
                        PRESS PASS · ប័ណ្ណអ្នកសារព័ត៌មាន
                      </div>
                    </div>

                    {/* Passport Photo + Metallic Security Chip */}
                    <div className="flex flex-col items-center my-2 relative z-10 flex-shrink-0">
                      <div className="w-[110px] h-[138px] rounded-xl overflow-hidden border-2 border-white shadow-xl bg-slate-900 flex items-center justify-center relative">
                        {activePhoto ? (
                          <Image src={activePhoto} alt="Staff" width={110} height={138} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <svg className="w-12 h-12 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>
                      {/* Metallic Silver Chip */}
                      <div className="-mt-3.5 z-20 w-8 h-5 rounded flex flex-wrap gap-[1px] p-[2px] shadow-md overflow-hidden bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-slate-400">
                        <div className="w-3 h-1.5 border border-black/20 rounded-[1px]"></div>
                        <div className="w-3 h-1.5 border border-black/20 rounded-[1px]"></div>
                        <div className="w-3 h-1.5 border border-black/20 rounded-[1px]"></div>
                        <div className="w-3 h-1.5 border border-black/20 rounded-[1px]"></div>
                      </div>
                    </div>

                    {/* Staff Name & Role Details */}
                    <div className="text-center z-10 my-1">
                      <p className="text-[15px] sm:text-[16px] font-extrabold text-white leading-tight uppercase truncate">
                        {activeName}
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-100 uppercase tracking-wide truncate mt-0.5">
                        {activeRole}
                      </p>
                      {activeDept && (
                        <p className="text-[8.5px] text-red-100 font-medium truncate mt-0.5">{activeDept}</p>
                      )}
                    </div>

                    {/* 2x2 Fields Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-black/30 p-2 rounded-xl border border-white/20 z-10 my-1 text-center">
                      <div>
                        <p className="text-[6.5px] text-red-100 font-bold uppercase">អត្តលេខ / ID</p>
                        <p className="text-[9px] font-extrabold text-white font-mono">{activeId}</p>
                      </div>
                      <div>
                        <p className="text-[6.5px] text-red-100 font-bold uppercase">ថ្ងៃកំណើត / DOB</p>
                        <p className="text-[9px] font-bold text-white">{activeDob || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[6.5px] text-red-100 font-bold uppercase">ចេញថ្ងៃ / ISSUED</p>
                        <p className="text-[9px] font-bold text-white">{issuedDisplay}</p>
                      </div>
                      <div>
                        <p className="text-[6.5px] text-red-100 font-bold uppercase">ផុតកំណត់ / VALID</p>
                        <p className="text-[9px] font-extrabold text-white">{validUntilDisplay}</p>
                      </div>
                    </div>

                    {/* Barcode inside White Scan Container */}
                    <div className="bg-white p-1.5 rounded-lg shadow-inner z-10 flex-shrink-0">
                      <DynamicBarcode id={activeId} height={22} />
                      <p className="text-[6px] text-gray-700 font-mono tracking-widest text-center mt-0.5">{activeId}</p>
                    </div>
                  </div>

                  {/* ═══════════════ LIVE BACK CARD (Vertical Portrait - No Yellow) ═══════════════ */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(180deg, #800000 0%, #b80000 50%, #660000 100%)',
                      fontFamily: "'Battambang', sans-serif",
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      color: '#ffffff',
                    }}
                  >
                    {/* Magnetic stripe */}
                    <div className="w-full h-7 bg-black rounded-lg flex-shrink-0"></div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center my-2">
                      <div className="p-2 bg-white rounded-xl shadow-lg">
                        <QRCodeSVG value={verifyUrl} size={90} level="H" includeMargin={false} />
                      </div>
                    </div>

                    {/* Cardholder Info */}
                    <div className="bg-black/35 border border-white/20 rounded-xl p-2.5 text-center">
                      <p className="text-[7px] text-red-100 font-bold uppercase">ម្ចាស់កាត / CARDHOLDER</p>
                      <p className="text-[12px] font-extrabold text-white uppercase truncate mt-0.5">{activeName}</p>
                      <p className="text-[9px] font-bold text-slate-100 uppercase truncate mt-0.5">{activeRole}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-black/35 border border-white/20 rounded-lg p-1.5">
                        <p className="text-[6px] text-red-100 font-bold uppercase">ចេញថ្ងៃ</p>
                        <p className="text-[8.5px] font-bold text-white">{issuedDisplay}</p>
                      </div>
                      <div className="bg-black/35 border border-white/30 rounded-lg p-1.5">
                        <p className="text-[6px] text-red-100 font-bold uppercase">ផុតកំណត់</p>
                        <p className="text-[8.5px] font-extrabold text-white">{validUntilDisplay}</p>
                      </div>
                    </div>

                    {/* Signature Strip */}
                    <div className="bg-white/95 rounded-lg h-5 flex items-center px-2 justify-between">
                      <span className="text-[6px] text-gray-600 font-bold uppercase">ហត្ថលេខាមានសមត្ថកិច្ច</span>
                      <span className="text-[9px] text-gray-900 font-bold italic" style={{ fontFamily: 'cursive' }}>
                        {activeName.split(' ')[0] || 'Signature'}
                      </span>
                    </div>

                    {/* Terms */}
                    <div className="border-t border-white/15 pt-1 text-center">
                      <p className="text-[6.5px] text-red-100 leading-tight">
                        កាតនេះជាកម្មសិទ្ធិរបស់ STEAV NEWS MEDIA។ ប្រសិនបើបាត់បង់ សូមប្រគល់ជូនការិយាល័យកណ្តាល រាជធានីភ្នំពេញ។
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              <p className="no-print text-xs text-gray-400 text-center" style={{ fontFamily: "'Battambang', sans-serif" }}>ចុចលើកាតដើម្បីបង្វិល • ទំហំស្តង់ដារ CR80 Vertical (54 × 85.6 mm)</p>
            </div>

          </div>
        </div>
      </main>

      {/* ── OFFSCREEN DEDICATED EXPORT NODES (Full Red Vertical 100% Unclipped 300 DPI Export - No Yellow) ── */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', overflow: 'hidden', zIndex: -9999, pointerEvents: 'none' }}>
        {/* FRONT EXPORT CARD (638px x 1012px - Full Red Vertical Portrait CR80 Ratio) */}
        <div
          id="export-card-front"
          style={{
            width: '638px',
            height: '1012px',
            background: 'linear-gradient(180deg, #b80000 0%, #e60000 50%, #990000 100%)',
            fontFamily: "'Battambang', sans-serif",
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            color: '#ffffff',
            border: '4px solid #ffffff',
            padding: '24px',
          }}
        >
          {/* Lanyard Slot & Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '90px', height: '14px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.4)' }}></div>
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>
              STEAV <span style={{ color: '#ffffff' }}>NEWS</span> <span style={{ fontSize: '15px', color: '#ffe6e6', marginLeft: '6px' }}>MEDIA</span>
            </div>
            <div style={{ background: '#ffffff', color: '#b80000', fontSize: '14px', fontWeight: '900', padding: '4px 20px', borderRadius: '16px', fontFamily: "'Koulen', sans-serif" }}>
              កាតផ្លូវការ · PRESS PASS
            </div>
          </div>

          {/* Passport Photo + Metallic Security Chip */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0' }}>
            <div style={{ width: '170px', height: '215px', borderRadius: '14px', overflow: 'hidden', border: '4px solid #ffffff', boxShadow: '0 10px 24px rgba(0,0,0,0.3)', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activePhoto ? (
                <img src={activePhoto} alt="Staff" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg style={{ width: '80px', height: '80px', color: 'rgba(255,255,255,0.4)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>

            {/* Metallic Silver Chip */}
            <div style={{ marginTop: '-20px', width: '64px', height: '44px', borderRadius: '6px', background: 'linear-gradient(135deg,#f8fafc,#cbd5e1,#94a3b8)', border: '1px solid #94a3b8', padding: '4px', display: 'flex', flexWrap: 'wrap', gap: '3px', zIndex: 10 }}>
              <div style={{ width: '24px', height: '14px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
              <div style={{ width: '24px', height: '14px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
              <div style={{ width: '24px', height: '14px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
              <div style={{ width: '24px', height: '14px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
            </div>
          </div>

          {/* Name & Role */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', lineHeight: '1.2' }}>{activeName}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '6px', textTransform: 'uppercase' }}>{activeRole}</div>
            {activeDept && <div style={{ fontSize: '15px', color: '#ffe6e6', marginTop: '4px' }}>{activeDept}</div>}
          </div>

          {/* 2x2 Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#ffe6e6', fontWeight: 'bold' }}>អត្តលេខ / STAFF ID</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>{activeId}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#ffe6e6', fontWeight: 'bold' }}>ថ្ងៃកំណើត / DOB</div>
              <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ffffff' }}>{activeDob || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#ffe6e6', fontWeight: 'bold' }}>ចេញថ្ងៃ / ISSUED</div>
              <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ffffff' }}>{issuedDisplay}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#ffe6e6', fontWeight: 'bold' }}>ផុតកំណត់ / VALID UNTIL</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>{validUntilDisplay}</div>
            </div>
          </div>

          {/* Barcode Section (Clean White Box for Scanning) */}
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ width: '100%', height: '48px' }}>
              <DynamicBarcode id={activeId} height={48} />
            </div>
            <div style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace', textAlign: 'center', marginTop: '4px' }}>{activeId}</div>
          </div>
        </div>

        {/* BACK EXPORT CARD (638px x 1012px) */}
        <div
          id="export-card-back"
          style={{
            width: '638px',
            height: '1012px',
            background: 'linear-gradient(180deg, #800000 0%, #b80000 50%, #660000 100%)',
            fontFamily: "'Battambang', sans-serif",
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            color: '#ffffff',
            border: '4px solid #ffffff',
            padding: '24px',
          }}
        >
          {/* Magnetic Stripe */}
          <div style={{ width: '100%', height: '65px', background: '#000000', borderRadius: '8px' }}></div>

          {/* QR Code Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
              <QRCodeSVG value={verifyUrl} size={160} level="H" includeMargin={false} />
            </div>
          </div>

          {/* Cardholder Info */}
          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#ffe6e6', fontWeight: 'bold' }}>ម្ចាស់កាត / CARDHOLDER</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>{activeName}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginTop: '2px' }}>{activeRole}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#ffe6e6' }}>ចេញថ្ងៃ / ISSUED</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{issuedDisplay}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#ffe6e6' }}>ផុតកំណត់ / EXPIRES</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{validUntilDisplay}</div>
            </div>
          </div>

          {/* Signature Bar */}
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '12px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 'bold' }}>ហត្ថលេខាមានសមត្ថកិច្ច</span>
            <span style={{ fontSize: '18px', color: '#111827', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'cursive' }}>{activeName.split(' ')[0] || 'Signature'}</span>
          </div>

          {/* Terms */}
          <div style={{ fontSize: '13px', color: '#ffe6e6', lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px', textAlign: 'center' }}>
            កាតនេះជាកម្មសិទ្ធិរបស់ STEAV NEWS MEDIA។ ប្រសិនបើបាត់បង់ សូមប្រគល់ជូនការិយាល័យកណ្តាល រាជធានីភ្នំពេញ។
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
