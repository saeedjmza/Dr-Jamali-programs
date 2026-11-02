import React, { useState } from 'react';
import { AppLogo } from './common/AppLogo';
import {
  X,
  UserCheck,
  Mail,
  Phone,
  Award,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Tag,
  Heart,
  Coffee,
  MessageSquare,
} from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const email = 'Saeed.jm.za@gmail.com';
  const phone = '+989124282899';
  const internationalPhone = '+989124282899';

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isFa ? 'مشخصات تولیدکنندگان و شناسنامه سامانه' : 'System Credits & Development Team'}</span>
                <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/40 shrink-0">
                  <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isFa ? 'ورژن ۱.۰' : 'Version 1.0'}</span>
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'طبقه‌بندی و طرح تونل بر اساس روابط تجربی'
                  : 'Tunnel Classification & Design Based on Empirical Relationships'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFa ? 'بستن' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed">
          {/* Main Lead Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] text-indigo-300 font-medium">
                    {isFa ? 'مدیر طراحی و سرپرست علمی سامانه' : 'Design Director & Lead Engineer'}
                  </div>
                  <h4 className="text-base font-black text-slate-100 mt-0.5">
                    {isFa ? 'سعید جمالی زواره' : 'Saeed Jamali Zavareh'}
                  </h4>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    {isFa ? 'دکترای مهندسی مکانیک سنگ' : 'Ph.D. in Rock Mechanics Engineering'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isFa ? 'نگارش رسمی ۱.۰' : 'Release v1.0'}
                </span>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Email Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isFa ? 'پست الکترونیک' : 'Email Address'}
                    </div>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs font-mono text-slate-200 hover:text-blue-300 transition-colors truncate block"
                      dir="ltr"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(email, 'email')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isFa ? 'کپی ایمیل' : 'Copy Email'}
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`mailto:${email}`}
                    className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 transition-colors cursor-pointer"
                    title={isFa ? 'ارسال ایمیل' : 'Send Email'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isFa ? 'تلفن تماس مستقیم' : 'Phone Number'}
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="text-xs font-mono text-emerald-300 hover:text-emerald-200 font-bold block"
                      dir="ltr"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(phone, 'phone')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isFa ? 'کپی شماره' : 'Copy Phone'}
                  >
                    {copiedPhone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${phone}`}
                    className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition-colors cursor-pointer"
                    title={isFa ? 'تماس' : 'Call'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Support & Feedback Section */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-2.5 text-slate-200">
                <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11.5px] leading-relaxed">
                  {isFa
                    ? 'توسعه‌دهندگان آماده شنیدن انتقادات و پیشنهادات شما هستند. در صورت رضایت از برنامه و علاقه به توسعه نرم‌افزارهای بیشتر می‌توانید از ما حمایت کنید:'
                    : 'The developers welcome your constructive feedback and suggestions. If you find this software helpful and wish to support further geotechnical software development, you can support us at:'}
                </p>
              </div>

              {/* Financial Support Links */}
              <div className="space-y-2 pt-1 border-t border-amber-500/20">
                {/* 1. Daramet Link (First) */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                  <a
                    href="https://daramet.com/saeedjamali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5 text-emerald-100" />
                    <span>{isFa ? 'حمایت مالی در درآمَدَت (Daramet)' : 'Support Development on Daramet'}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-100" />
                  </a>
                  <a
                    href="https://daramet.com/saeedjamali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-emerald-300 hover:underline select-all"
                    dir="ltr"
                  >
                    https://daramet.com/saeedjamali
                  </a>
                </div>

                {/* 2. Hamibash Link (Underneath Daramet) */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
                  <a
                    href="https://hamibash.com/tunnelapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
                    <span>{isFa ? 'حمایت از توسعه نرم‌افزار در حامی‌باش' : 'Support Development on Hamibash'}</span>
                    <ExternalLink className="w-3 h-3 text-amber-100" />
                  </a>
                  <a
                    href="https://hamibash.com/tunnelapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-amber-300/90 hover:underline select-all"
                    dir="ltr"
                  >
                    https://hamibash.com/tunnelapp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Software Scope & Capabilities */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>
                {isFa
                  ? 'اهداف و دامنه محاسباتی نرم‌افزار (ورژن ۱.۰):'
                  : 'Software Objectives & Theoretical Scope (Version 1.0):'}
              </span>
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              {isFa
                ? 'این سامانه تخصصی با هدف تجمیع، مقایسه و بهره‌گیری هوشمند از معتبرترین روابط تجربی و تجارب عملی پروژه‌های تونل‌سازی در دنیا طراحی شده است و امکان طبقه‌بندی مهندسی سنگ، تخمین زمان خودایستایی، محاسبه بار سنگ و پیشنهاد سیستم نگهداری تجربی را در هر دو بستر آنلاین و آفلاین فراهم می‌سازد.'
                : 'This system is tailored for geotechnical and rock engineering practitioners to synthesize, calculate, and visualize empirical tunnel classification and support design in both online and offline environments.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start gap-2">
                <Layers className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">
                    {isFa ? 'سیستم‌های طبقه‌بندی تجربی' : 'Classification Systems'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bieniawski RMR (1989), Barton Q-System (1974/2002), Hoek & Brown GSI (1994/2002)
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start gap-2">
                <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">
                    {isFa ? 'زمان خودپایداری و بار سنگ' : 'Stand-up Time & Rock Load'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bieniawski Log Curves, Barton Span Equations, Deere RQD & Terzaghi Load
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">
                    {isFa ? 'طراحی سیستم نگهداری' : 'Support Design'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    RMR Support Table, Barton Q Chart, Russo (1998/2014) Face Stability & Pre-support
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200 text-[11px]">
                    {isFa ? 'قابلیت حفاری و ریپرزنی' : 'Excavability & Blastability'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Weaver (1975), Franklin (1971), Isaksson (2002 DRI & Powder Factor)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            {isFa ? 'مدیر طراحی: سعید جمالی زواره | نگارش ۱.۰' : 'Design Director: Saeed Jamali Zavareh | Version 1.0'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
