import React, { useState, useRef } from 'react';
import { Search, Sparkles, AlertCircle, Plus, X, FileText, Image as ImageIcon, Zap } from 'lucide-react';
import { z } from 'zod';
import { ConsentModal } from './ConsentModal';

export const ScanInput = ({ onScan, isLoading }) => {
  const [text, setText] = useState('');
  const [source, setSource] = useState('other');
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [justAttached, setJustAttached] = useState(false);

  // 3D Card Tilt & Cursor Border State
  const cardRef = useRef(null);
  const [cardTransform, setCardTransform] = useState('');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // 3D Button Tilt & Pull State
  const btnRef = useRef(null);
  const [btnTransform, setBtnTransform] = useState('');
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const fileInputRef = useRef(null);

  const samplePresets = [
    {
      label: '🚨 Fake Netflix SMS',
      source: 'sms',
      type: 'scam',
      text: 'URGENT: Your Netflix subscription has expired. Payment failed on 05/08/2026. Update your billing info immediately at http://netflix-verify-acc-9812.com or your account will be deleted in 24 hours!'
    },
    {
      label: '🏦 Bank Phishing Email',
      source: 'email',
      type: 'scam',
      text: 'Dear Customer, your Bank of America account #****4912 has been temporarily suspended due to 3 unauthorized login attempts. Click here to verify your SSN and restore access: https://boa-secure-login-portal.net'
    },
    {
      label: '✅ Safe Team Email',
      source: 'email',
      type: 'safe',
      text: 'Hi Team, please find attached the updated project roadmap and Q3 deliverables schedule for our upcoming client meeting on Thursday. Let me know if you have any questions.'
    }
  ];

  // 3D Card Tilt Handler (Max ~3.5 deg rotation)
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = (x / rect.width) - 0.5;
    const yRatio = (y / rect.height) - 0.5;

    setMousePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    const rotateY = xRatio * 7; // ~3.5 deg max
    const rotateX = -yRatio * 7;
    setCardTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`);
  };

  const handleCardMouseLeave = () => {
    setCardTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  // 3D Analyze Button Mouse Move Handler (Disabled during loading)
  const handleBtnMouseMove = (e) => {
    if (isLoading || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    const deltaX = e.clientX - btnCenterX;
    const deltaY = e.clientY - btnCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = Math.max(rect.width, rect.height) / 2 + 50;

    if (distance < maxRadius) {
      const pullFactor = (1 - distance / maxRadius) * 6;
      const magX = (deltaX / (distance || 1)) * pullFactor;
      const magY = (deltaY / (distance || 1)) * pullFactor;

      const xRel = e.clientX - rect.left;
      const yRel = e.clientY - rect.top;
      const rotateY = ((xRel / rect.width) - 0.5) * 14;
      const rotateX = -((yRel / rect.height) - 0.5) * 14;

      setBtnTransform(`perspective(1000px) translate3d(${magX}px, ${magY}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    } else {
      setBtnTransform('perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    }
  };

  const handleBtnMouseLeave = () => {
    setIsBtnHovered(false);
    setBtnTransform('perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const handleAttachmentClick = () => {
    if (isLoading) return;
    const hasConsented = localStorage.getItem('scamshield_upload_consent');
    if (hasConsented) {
      if (fileInputRef.current) fileInputRef.current.click();
    } else {
      setShowConsentModal(true);
    }
  };

  const handleConsentConfirm = () => {
    localStorage.setItem('scamshield_upload_consent', 'true');
    setShowConsentModal(false);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 100);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds 5MB max limit. Please select a smaller image or PDF file.');
      return;
    }

    setValidationError(null);
    setAttachedFile(file);

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }

    // Trigger brief satisfying micro-animation pulse on attach success
    setJustAttached(true);
    setTimeout(() => setJustAttached(false), 600);
  };

  const handleRemoveFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setAttachedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    const hasText = text.trim().length >= 10;
    const hasFile = Boolean(attachedFile);

    if (!hasText && !hasFile) {
      setValidationError('Please enter a message of at least 10 characters or attach an image/PDF file.');
      return;
    }

    if (hasText && text.length > 5000) {
      setValidationError('Message text cannot exceed 5000 characters.');
      return;
    }

    if (attachedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result;
        onScan(text, source, {
          fileData: base64Data,
          fileMimeType: attachedFile.type,
          sourceType: 'image',
          fileName: attachedFile.name
        });
      };
      reader.onerror = () => {
        setValidationError('Failed to read attached file.');
      };
      reader.readAsDataURL(attachedFile);
    } else {
      onScan(text, source, { sourceType: 'text' });
    }
  };

  const handleLoadSample = (sample) => {
    setText(sample.text);
    setSource(sample.source);
    setValidationError(null);
  };

  const isSubmitDisabled = isLoading || (!attachedFile && text.length < 10) || text.length > 5000;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={{
        transform: cardTransform,
        transition: cardTransform ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
      className="relative glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 overflow-hidden"
    >
      {/* 3. Soft Dynamic Border Glow that follows Cursor position */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(6, 182, 212, 0.15), transparent 70%)`
        }}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Permission Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsentModal(false)}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Inspect Message or Screenshot for Scams
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
            Paste suspicious text or click the <strong className="text-cyan-300 font-mono">+</strong> button to attach a screenshot or PDF.
          </p>
        </div>

        {/* 8. Source Dropdown with Hover Glow & Transition */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Source:
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isLoading}
            className="glass-input rounded-xl px-3.5 py-1.5 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 outline-none cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_14px_rgba(6,182,212,0.3)] focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(6,182,212,0.4)] transition-all duration-200"
          >
            <option value="other">Other / Unknown</option>
            <option value="email">Email</option>
            <option value="sms">SMS Text Message</option>
            <option value="whatsapp">WhatsApp Message</option>
            <option value="social_media">Social Media DM</option>
          </select>
        </div>
      </div>

      {/* 6. Quick Sample Chips with Custom Risk Hover Glows & Active Press */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Quick Samples:
        </span>
        {samplePresets.map((preset, idx) => {
          const isScamType = preset.type === 'scam';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(preset)}
              disabled={isLoading}
              className={`text-xs font-medium text-slate-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 transition-all duration-200 active:scale-95 hover:scale-[1.04] ${
                isScamType
                  ? 'hover:border-rose-500/60 hover:text-rose-300 hover:shadow-md hover:shadow-rose-950/60'
                  : 'hover:border-emerald-500/60 hover:text-emerald-300 hover:shadow-md hover:shadow-emerald-950/60'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        {/* 7. Textarea Container with Custom Animated Focus Glow Pulse */}
        <div
          className={`relative glass-panel rounded-xl p-1 transition-all duration-300 ${
            isFocused
              ? text.length === 0
                ? 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)] animate-glow-pulse'
                : 'border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.3)]'
              : 'border border-slate-700/70 hover:border-slate-600'
          }`}
        >
          <textarea
            value={text}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isLoading}
            rows={5}
            placeholder={
              attachedFile
                ? "File attached. You can optionally add notes or leave empty..."
                : "Paste suspicious text here or attach a screenshot / PDF using the '+' button below..."
            }
            className="w-full bg-transparent rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 font-sans leading-relaxed outline-none resize-none"
          />

          {/* Attached File Thumbnail / Preview Chip */}
          {attachedFile && (
            <div className="mx-4 mb-3 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between gap-3 max-w-sm animate-fade-in shadow-lg">
              <div className="flex items-center gap-3 overflow-hidden">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Uploaded attachment preview"
                    className="w-10 h-10 object-cover rounded-lg border border-cyan-500/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate text-xs">
                  <p className="font-semibold text-slate-200 truncate">{attachedFile.name}</p>
                  <p className="text-[11px] font-mono text-cyan-400">
                    {(attachedFile.size / 1024).toFixed(1)} KB · {attachedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isLoading}
                title="Remove attached file"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Controls Bar inside Textarea container */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 rounded-b-xl">
            {/* 5. Attach Screenshot / PDF Button with Hover Rotation & Success Micro-Pulse */}
            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={isLoading}
              title="Attach screenshot or PDF"
              className={`p-2 rounded-xl bg-slate-900 border text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 group hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-950/50 ${
                justAttached
                  ? 'animate-attach-pulse text-emerald-300 border-emerald-500/70 bg-emerald-950/40 shadow-md shadow-emerald-950/60'
                  : 'border-slate-700/80 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-950/40'
              }`}
            >
              <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Attach Screenshot / PDF</span>
            </button>

            {/* Character Count */}
            <div className="text-[11px] font-mono text-slate-500">
              <span className={text.length > 5000 ? 'text-rose-400 font-bold' : ''}>
                {text.length}
              </span> / 5000 chars
            </div>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 4. "Analyze Message Risk" Button — Idle Shimmer + Hover 3D Tilt & Magnetic Pull */}
        <div className="flex justify-end pt-2">
          <div
            ref={btnRef}
            onMouseMove={handleBtnMouseMove}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={handleBtnMouseLeave}
            style={{
              transform: !isLoading && isBtnHovered ? btnTransform : 'perspective(1000px) translate3d(0px,0px,0px) rotateX(0deg) rotateY(0deg)',
              transition: isBtnHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="relative overflow-hidden rounded-xl group"
          >
            {/* Continuous Idle Shimmer Sweep Layer */}
            {!isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent pointer-events-none animate-shimmer-sweep" />
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary font-bold text-white px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 transition-all duration-200 group-hover:shadow-2xl group-hover:shadow-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5 text-white" />
              <span>{attachedFile ? 'Analyze File Risk' : 'Analyze Message Risk'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
