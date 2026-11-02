import React, { useState } from 'react';
import { AppLogo } from './common/AppLogo';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  WifiOff,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const OFFICIAL_ANDROID_URL = 'https://ais-pre-fcstyvfufuog5ozewob7r4-655471265608.europe-west2.run.app';

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose, lang }) => {
  const isFa = lang === 'fa';
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'features'>('direct');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  // Determine valid mobile access URL:
  // If running locally (desktop EXE, localhost, 127.0.0.1, file:), ALWAYS use the verified live cloud URL
  // so mobile phones scanning the QR code or opening the link can actually reach the app!
  const isLocalEnvironment =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:' ||
      window.location.hostname === '');

  const mobileAppUrl = !isLocalEnvironment && typeof window !== 'undefined' && window.location.origin.startsWith('http')
    ? window.location.origin
    : OFFICIAL_ANDROID_URL;

  // QR code URL using public QR code API pointing to the valid public URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    mobileAppUrl
  )}&bgcolor=090d16&color=38bdf8&margin=10`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tunnelapp 1.0 - Geomechanical Tunnel Calculator',
          text: isFa ? 'نرم‌افزار مهندسی تحلیل ژئومکانیکی و زمان پایداری تونل' : 'Geomechanical Tunnel Calculator',
          url: mobileAppUrl,
        });
      } catch {
        handleCopy(mobileAppUrl);
      }
    } else {
      handleCopy(mobileAppUrl);
    }
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <AppLogo size="md" className="shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{isFa ? 'نسخه اندروید و نصب در تلفن همراه' : 'Android App Installation Guide'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
                  Android & PWA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFa
                  ? 'نصب مستقیم به عنوان برنامه بومی در گوشی با قابلیت کارکرد ۱۰۰٪ آفلاین در عمق تونل'
                  : 'Install directly on your Android device with 100% offline tunnel capability'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {isFa ? 'نصب مستقیم روی گوشی' : 'Direct Installation'}
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {isFa ? 'راهنمای فایل نصبی APK' : 'APK File Guide'}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 font-semibold text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            {isFa ? 'کارکرد آفلاین در تونل' : 'Offline Tunnel Features'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: DIRECT INSTALLATION */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              {/* If on Android browser and installable prompt is ready */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1 text-center sm:text-right">
                    <span className="font-bold text-emerald-300 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      {isFa ? 'دستگاه شما آماده نصب مستقیم است!' : 'Your device is ready for direct installation!'}
                    </span>
                    <p className="text-slate-300 text-xs">
                      {isFa
                        ? 'با لمس دکمه زیر، برنامه مستقیماً در لیست برنامه‌های گوشی شما نصب می‌شود.'
                        : 'Tap below to immediately install the app to your Android device.'}
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all transform active:scale-95 shrink-0"
                  >
                    <Smartphone className="w-4 h-4" />
                    {isFa ? 'نصب فوری نسخه اندروید' : 'Install Android App Now'}
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isFa
                      ? 'برنامه در حال حاضر به عنوان اپلیکیشن مستقل در گوشی شما نصب و فعال است.'
                      : 'The application is already installed in standalone mode.'}
                  </span>
                </div>
              )}

              {/* QR Code & Mobile URL Sharing */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for Android"
                    className="w-36 h-36 rounded-lg"
                  />
                </div>
                <div className="space-y-2.5 text-center sm:text-right flex-1">
                  <h4 className="font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    {isFa ? 'اسکن با دوربین گوشی موبایل' : 'Scan with Mobile Camera'}
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {isFa
                      ? 'دوربین گوشی اندروید خود را روی بارکد بالا بگیرید تا لینک برنامه باز شود؛ سپس کافیست دکمه "نصب" یا "افزودن به صفحه اصلی" را بزنید.'
                      : 'Scan this QR code with your phone camera to open the application, then tap "Install" or "Add to Home Screen".'}
                  </p>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={mobileAppUrl}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-emerald-400 w-full select-all"
                      />
                      <button
                        onClick={() => handleCopy(mobileAppUrl)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
                        title={isFa ? 'کپی آدرس' : 'Copy URL'}
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی آدرس' : 'Copy')}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={mobileAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isFa ? 'باز کردن مستقیم در مرورگر' : 'Open Directly in Browser'}</span>
                      </a>
                      <button
                        onClick={handleShare}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isFa ? 'اشتراک‌گذاری' : 'Share'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions for Android */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  {isFa ? 'مراحل گام‌به‌گام نصب در اندروید (Chrome و Samsung Internet):' : 'Step-by-Step Android Installation:'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۱</span>
                      <span>{isFa ? 'باز کردن در مرورگر' : 'Open in Browser'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isFa
                        ? 'آدرس سامانه را در مرورگر Google Chrome یا Samsung Internet گوشی خود باز کنید.'
                        : 'Open the app URL in Google Chrome or Samsung Internet browser on your phone.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۲</span>
                      <span>{isFa ? 'منوی سه‌نقطه (⋮)' : 'Menu (⋮)'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isFa
                        ? 'روی علامت سه‌نقطه در بالا یا پایین مرورگر ضربه بزنید و گزینه "نصب برنامه" (Install app) یا "افزودن به صفحه اصلی" را لمس کنید.'
                        : 'Tap the three dots menu (⋮) and select "Install app" or "Add to Home screen".'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">۳</span>
                      <span>{isFa ? 'تأیید نصب' : 'Confirm Install'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isFa
                        ? 'دکمه Install را بزنید؛ آیکون نرم‌افزار مهندسی روی صفحه گوشی اضافه شده و مستقل و آفلاین اجرا می‌شود.'
                        : 'Tap Install. The dedicated app icon appears on your home screen for offline access.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APK FILE INSTALLATION GUIDE */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isFa ? 'راهنمای نصب فایل با پسوند APK در گوشی:' : 'How to install the APK file on Android:'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {isFa
                    ? 'در صورتی که فایل پکیج نصبی اندروید (فایل با پسوند .apk) توسط مدیر پروژه یا توسعه‌دهنده در اختیارتان قرار گرفته است، می‌توانید به سادگی آن را روی گوشی نصب کنید:'
                    : 'If you have received the standalone .apk installation package, follow these simple steps to install it on your device:'}
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      ۱
                    </span>
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">
                        {isFa ? 'دریافت و باز کردن فایل' : 'Open the APK file'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                        {isFa
                          ? 'فایل APK را از طریق پیام‌رسان، فلش، یا پوشه دانلودها در گوشی خود لمس کنید.'
                          : 'Download or transfer the APK file to your phone and tap on it.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      ۲
                    </span>
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">
                        {isFa ? 'تأیید دسترسی نصب (در صورت نیاز)' : 'Allow Installation (if prompted)'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                        {isFa
                          ? 'در صورتی که اندروید درخواست مجوز کرد، گزینه "اجازه به این منبع" (Allow from this source) یا Settings را فعال نمایید.'
                          : 'If prompted by Android security, enable "Allow from this source".'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      ۳
                    </span>
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">
                        {isFa ? 'نصب و اجرای برنامه' : 'Complete Installation'}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                        {isFa
                          ? 'دکمه Install را بزنید. پس از چند ثانیه برنامه نصب شده و بدون نیاز به اینترنت آماده استفاده خواهد بود.'
                          : 'Tap Install to finish. The app will be available in your application drawer.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PWABuilder Online APK Generator Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      {isFa ? 'تولید رایگان و مستقیم فایل APK با PWABuilder' : 'Generate Free Signed APK with PWABuilder'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                    Online Builder
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isFa
                    ? 'سامانه رایگان Microsoft PWABuilder به شما امکان می‌دهد ظرف ۳۰ ثانیه بدون نیاز به نصب هیچ نرم‌افزاری، مستقیماً فایل نصبی APK اختصاصی این پروژه را دانلود کنید.'
                    : 'Microsoft PWABuilder lets you package this verified PWA into a signed standalone Android APK in 30 seconds with no tool installations.'}
                </p>
                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(OFFICIAL_ANDROID_URL)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isFa ? 'ورود به PWABuilder و دانلود APK' : 'Open PWABuilder & Package APK'}</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & OFFLINE SPECIFICATIONS */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <WifiOff className="w-4 h-4" />
                    <span>{isFa ? 'کارکرد کاملاً آفلاین در تونل' : '100% Offline in Underground Tunnels'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isFa
                      ? 'تمامی جداول، نمودارهای بینیاوسکی، بارتون، روسو، هوک-براون و فونت‌ها در حافظه کش گوشی ذخیره می‌شوند و بدون کوچک‌ترین نیاز به اینترنت در عمق تونل کار می‌کنند.'
                      : 'All charts, Bieniawski, Barton, Russo models, and fonts are cached locally for zero-internet underground job sites.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Smartphone className="w-4 h-4" />
                    <span>{isFa ? 'تجربه تمام‌صفحه و بدون نوار آدرس' : 'Standalone Fullscreen Experience'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isFa
                      ? 'هنگام باز شدن از صفحه اصلی، نوار آدرس و دکمه‌های مزاحم مرورگر حذف شده و حس یک نرم‌افزار مهندسی نیتیو اندروید را به کاربر می‌دهد.'
                      : 'Launches without browser URL bars or navigation clutter for a true native application feel.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isFa ? 'به‌روزرسانی خودکار هوشمند' : 'Background Smart Auto-Update'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isFa
                      ? 'به محض اتصال گوشی به اینترنت، در صورت ارائه نسخه یا فرمول جدید، برنامه در پس‌زمینه خودبه‌خود آپدیت می‌شود.'
                      : 'Whenever internet is available, updates are seamlessly fetched in the background.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>{isFa ? 'سبک و بدون اشغال حافظه' : 'Ultra-Lightweight Storage'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isFa
                      ? 'حجم کل برنامه کمتر از ۵ مگابایت بوده و هیچ‌گونه مصرف باتری یا اشغال حافظه اضافی در گوشی ندارد.'
                      : 'Extremely lightweight (<5MB) with negligible battery consumption.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFa ? 'سازگار با تمام نسخه‌های اندروید (Android 6.0 تا Android 15+)' : 'Compatible with Android 6.0 to 15+'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
