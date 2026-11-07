import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LegalDocumentConfig } from '../../types/legal';

interface LegalPageTemplateProps {
  config: LegalDocumentConfig;
}

export function LegalPageTemplate({ config }: LegalPageTemplateProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('Semua');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Extract FAQ categories if available
  const faqCategories = config.faqs
    ? ['Semua', ...Array.from(new Set(config.faqs.map(f => f.category || 'Umum')))]
    : [];

  const filteredFaqs = config.faqs?.filter(
    item => activeFaqCategory === 'Semua' || (item.category || 'Umum') === activeFaqCategory
  );

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-8">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-400">
        <Link to="/" className="hover:text-pink-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-neutral-300 font-medium">{config.title}</span>
      </nav>

      {/* 2. Page Header / Meta Block */}
      <header className="bg-neutral-800/60 border border-neutral-700/80 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {config.badge && (
            <span className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold rounded-full uppercase tracking-wider">
              {config.badge}
            </span>
          )}
          {config.version && (
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900/60 px-2.5 py-1 rounded-md border border-neutral-800">
              Versi {config.version}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed max-w-3xl">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* EffectiveDate & LastUpdated Grid */}
        <div className="pt-4 border-t border-neutral-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
            <span className="text-neutral-400 block text-[11px]">Tanggal Berlaku</span>
            <span className="font-semibold text-white mt-0.5 block">{config.effectiveDate}</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
            <span className="text-neutral-400 block text-[11px]">Terakhir Diperbarui</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block">{config.lastUpdated}</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-neutral-400 block text-[11px]">Tindakan Dokumen</span>
              <span className="font-semibold text-white mt-0.5 block">Dokumen Resmi</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-neutral-400 hover:text-pink-400 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Salin tautan dokumen"
              aria-label="Salin tautan dokumen"
            >
              {copiedLink ? (
                <span className="text-[10px] text-pink-400 font-bold">Tersalin!</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Quick Table of Contents (for multi-section policies) */}
      {config.sections && config.sections.length > 2 && (
        <nav aria-label="Daftar Isi" className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 sm:p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Navigasi Cepat Bab Kebijakan
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {config.sections.map(section => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-pink-400 px-3 py-1.5 rounded-lg border border-neutral-700/60 transition-colors inline-block"
              >
                {section.heading}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* 4. Document Content (Sections) */}
      <section className="space-y-6">
        {config.sections.map(section => (
          <div
            key={section.id}
            id={section.id}
            className="bg-neutral-800/40 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-20 hover:border-neutral-700/80 transition-colors"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-pink-500 inline-block" />
              {section.heading}
            </h2>

            {section.paragraphs && (
              <div className="space-y-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            )}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 pl-4 list-disc marker:text-pink-500">
                {section.bullets.map((item, bIdx) => (
                  <li key={bIdx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            )}

            {section.subsections && (
              <div className="space-y-3 pt-2">
                {section.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 text-xs">
                    <h3 className="font-bold text-white text-sm mb-1">{sub.title}</h3>
                    {sub.text && <p className="text-neutral-300 leading-relaxed">{sub.text}</p>}
                    {sub.bullets && (
                      <ul className="mt-2 pl-4 list-disc text-neutral-400 space-y-1">
                        {sub.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.callout && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                  section.callout.type === 'warning'
                    ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                    : section.callout.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                    : 'bg-indigo-950/40 border-indigo-600/40 text-indigo-200'
                }`}
              >
                {section.callout.text}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 5. Interactive FAQ Section (If Present) */}
      {config.faqs && config.faqs.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Daftar Pertanyaan & Jawaban</h2>
              <p className="text-xs text-neutral-400">Pilih topik atau klik pertanyaan untuk melihat jawaban</p>
            </div>

            {/* Category Filter */}
            {faqCategories.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {faqCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFaqCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      activeFaqCategory === cat
                        ? 'bg-pink-600 border-pink-500 text-white font-semibold'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredFaqs?.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-800/50 border border-neutral-700/80 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 hover:bg-neutral-800/80 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      {faq.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 hidden sm:inline-block">
                          {faq.category}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white">{faq.question}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-pink-400' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/80 animate-fade-in">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Contact Channels Grid (If Present) */}
      {config.contactChannels && config.contactChannels.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Saluran Kontak Resmi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.contactChannels.map((c, cIdx) => (
              <div
                key={cIdx}
                className="bg-neutral-800/70 border border-neutral-700 rounded-xl p-5 flex flex-col justify-between space-y-3 hover:border-pink-500/60 transition-colors"
              >
                <div>
                  {c.badge && (
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">
                      {c.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-white text-sm">{c.name}</h3>
                  <p className="font-mono text-xs text-pink-300 mt-1 break-all">{c.value}</p>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{c.description}</p>
                </div>

                {c.actionUrl && (
                  <a
                    href={c.actionUrl}
                    className="inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-pink-600 text-white text-xs font-semibold py-2 px-3 rounded-lg border border-neutral-700 hover:border-pink-500 transition-colors"
                  >
                    Hubungi Sekarang &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Related Legal Policies Navigation */}
      {config.relatedLinks && config.relatedLinks.length > 0 && (
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Dokumen Kebijakan Terkait
          </h3>
          <div className="flex flex-wrap gap-3">
            {config.relatedLinks.map(link => (
              <Link
                key={link.route}
                to={link.route}
                className="bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white px-4 py-2 rounded-lg border border-neutral-700 transition-colors"
              >
                {link.title} &rarr;
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. Help Contact Banner */}
      <div className="bg-gradient-to-r from-neutral-800/80 via-neutral-800/40 to-neutral-800/80 border border-neutral-700/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-white">Memiliki pertanyaan seputar ketentuan di atas?</h4>
          <p className="text-xs text-neutral-400 mt-1">Tim Customer Support kami siap memberikan penjelasan lengkap kepada Anda.</p>
        </div>
        <Link
          to="/contact-us"
          className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex-shrink-0"
        >
          Hubungi Customer Care
        </Link>
      </div>
    </article>
  );
}
