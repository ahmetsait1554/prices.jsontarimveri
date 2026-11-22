import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import type { AuthUser } from '@/components/AuthModal';
import { SettingsModal, type UserSettings } from '@/components/SettingsModal';
import { Footer } from '@/components/Footer';
import { TickerBand } from '@/components/TickerBand';
import { Dashboard } from '@/pages/Dashboard';
import { Commodities } from '@/pages/Commodities';
import { Compare } from '@/pages/Compare';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { Regions } from '@/pages/Regions';
import { ExchangeDetail } from '@/pages/ExchangeDetail';
import { LivestockPage } from '@/pages/LivestockPage';
import { LogisticsPage } from '@/pages/LogisticsPage';
import { ClimatePage } from '@/pages/ClimatePage';
import { NewsPage } from '@/pages/NewsPage';
import { HalPiyasalari } from '@/pages/HalPiyasalari';
import { DonationPage } from '@/pages/DonationPage';
import { AdvertisePage } from '@/pages/AdvertisePage';
import { LegalPages } from '@/pages/LegalPages';
import { matchCommodityId } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface NavContext {
  exchangeId: string | null;
  technicalSymbolId: string | null;
  selectedProductName: string | null;
  goExchange: (exchangeId: string) => void;
  goTechnical: (symbolId: string) => void;
  goProduct: (productName: string, targetPage?: PageId) => void;
  goPage: (page: PageId) => void;
}

const Ctx = createContext<NavContext>({
  exchangeId: null,
  technicalSymbolId: null,
  selectedProductName: null,
  goExchange: () => {},
  goTechnical: () => {},
  goProduct: () => {},
  goPage: () => {},
});

export const useNav = () => useContext(Ctx);

const pagePathById: Record<PageId, string> = {
  dashboard: '/dashboard',
  commodities: '/emtia-analizi',
  technical: '/teknik-analiz',
  compare: '/karsilastirma',
  calculator: '/karlilik-hesapla',
  regions: '/bolgesel-arz',
  exchange: '/borsa-detay',
  livestock: '/kesim-fiyatlari',
  logistics: '/lojistik-elus',
  climate: '/iklim-risk-ndvi',
  news: '/foodecon',
  hal: '/hal-piyasalari',
  donation: '/bagis',
  advertise: '/reklam-ver',
  privacy: '/gizlilik-politikasi',
  terms: '/kullanim-sartlari',
  contact: '/iletisim',
};

const pageIdByPath: Record<string, PageId> = Object.fromEntries(
  Object.entries(pagePathById).map(([id, path]) => [path, id as PageId]),
) as Record<string, PageId>;

const pageMeta: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Gösterge Paneli',
    subtitle: 'Tarımsal endeksler, girdi maliyetleri ve güncel borsa fiyatları',
  },
  commodities: {
    title: 'Emtia ve Ürün Analizi',
    subtitle: 'Ürün bazlı fiyat geçmişi, maliyet dökümü ve kârlılık oranları',
  },
  exchange: {
    title: 'Borsa Detayı',
    subtitle: 'Borsa bazlı ürün listesi ve teknik analiz entegrasyonu',
  },
  technical: {
    title: 'Teknik Analiz',
    subtitle: 'Mum grafikleri, indikatörler ve elle çizim araçları',
  },
  compare: {
    title: 'Ürün Karşılaştırma',
    subtitle: 'İki tarım ürününün dönemsel maliyet ve getiri kıyaslaması',
  },
  calculator: {
    title: 'Karlılık Hesaplama & Screener',
    subtitle: 'Dekar başına maliyet simülasyonu ve akıllı ürün filtreleme',
  },
  regions: {
    title: 'Bölgesel Arz ve Talep',
    subtitle: 'İl bazlı tarımsal ürün arz yoğunluğu ve arz-talep dengesi',
  },
  livestock: {
    title: 'Hayvan Kesim Fiyatları',
    subtitle: 'İl bazlı karkas et fiyatları ve çiftçi kâr/maliyet simülasyonu',
  },
  logistics: {
    title: 'Akıllı Lojistik ve ELÜS',
    subtitle: 'Lisanslı depoculuk, ELÜS takibi ve navlun maliyet hesaplayıcı',
  },
  climate: {
    title: 'İklim Risk Sigortası ve NDVI',
    subtitle: 'Parametrik sigorta simülasyonu ve uydu tabanlı tarla sağlık skoru',
  },
  news: {
    title: 'Tarım Haberleri & Piyasa Akışı',
    subtitle: 'Küresel tarım haberleri, piyasa etkileri ve risk haritası',
  },
  hal: {
    title: 'Hal Piyasaları',
    subtitle: 'Toptancı hal fiyatları ve şehir bazlı ürün bültenleri',
  },
  donation: {
    title: 'Bağış Yap',
    subtitle: 'Reklam izleyerek tarım verilerine destek olun',
  },
  advertise: {
    title: 'Reklam Ver',
    subtitle: 'Markanızı tarım kararlarının alındığı yerde görünür kılın',
  },
  privacy: {
    title: 'Gizlilik Politikası',
    subtitle: 'Verilerinizin nasıl işlendiğini ve korunduğunu açıklar',
  },
  terms: {
    title: 'Kullanım Şartları',
    subtitle: 'Platform kullanım koşulları ve sorumluluk sınırları',
  },
  contact: {
    title: 'İletişim',
    subtitle: 'Bizimle iletişime geçin',
  },
};

function App() {
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const currentPath = location.pathname.replace(/\/$/, '') || '/dashboard';
  const [page, setPage] = useState<PageId>(() => pageIdByPath[currentPath] ?? 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exchangeId, setExchangeId] = useState<string | null>(null);
  const [technicalSymbolId, setTechnicalSymbolId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<UserSettings['theme']>(() => {
    const saved = localStorage.getItem('tf_theme');
    return saved === 'light' || saved === 'system' || saved === 'emerald' ? saved : 'dark';
  });
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const applyTheme = () => {
      const isLight = theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
      const themeAttr = theme === 'emerald' ? 'emerald' : (isLight ? 'light' : 'dark');
      document.documentElement.dataset.theme = themeAttr;
      document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    };
    applyTheme();
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({ id: sessionUser.id, name: String(sessionUser.user_metadata?.name ?? sessionUser.email?.split('@')[0] ?? 'Kullanıcı'), email: sessionUser.email ?? '' });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(sessionUser ? { id: sessionUser.id, name: String(sessionUser.user_metadata?.name ?? sessionUser.email?.split('@')[0] ?? 'Kullanıcı'), email: sessionUser.email ?? '' } : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = useCallback((u: AuthUser) => {
    setUser(u);
    setAuthOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    void supabase?.auth.signOut();
    setUser(null);
    setSettingsOpen(false);
  }, []);

  const handleSettingsSave = useCallback((s: UserSettings) => {
    const updated = { id: user?.id ?? '', name: s.name, email: s.email };
    setUser(updated);
    setTheme(s.theme);
    localStorage.setItem('tf_user', JSON.stringify(updated));
    localStorage.setItem('tf_theme', s.theme);
  }, [user?.id]);

  const meta = pageMeta[page];

  useEffect(() => {
    const nextPage = pageIdByPath[currentPath];
    if (nextPage) {
      setPage(nextPage);
      const params = new URLSearchParams(location.search);
      const exchange = params.get('borsa');
      const product = params.get('urun');
      if (exchange) setExchangeId(exchange);
      if (product) setTechnicalSymbolId(product);
      return;
    }
    routerNavigate(pagePathById.dashboard, { replace: true });
  }, [currentPath, location.search, routerNavigate]);

  const goPage = useCallback((p: PageId) => {
    setPage(p);
    setSidebarOpen(false);
    routerNavigate(pagePathById[p]);
  }, [routerNavigate]);

  const goExchange = useCallback((id: string) => {
    setExchangeId(id);
    setPage('exchange');
    setSidebarOpen(false);
    routerNavigate(`${pagePathById.exchange}?borsa=${encodeURIComponent(id)}`);
  }, [routerNavigate]);

  const goTechnical = useCallback((symbolId: string) => {
    setTechnicalSymbolId(symbolId);
    setPage('commodities');
    setSidebarOpen(false);
    routerNavigate(`${pagePathById.commodities}?urun=${encodeURIComponent(symbolId)}`);
  }, [routerNavigate]);

  const goProduct = useCallback((productName: string, targetPage: PageId = 'commodities') => {
    setSelectedProductName(productName);
    const commodityId = matchCommodityId(productName);
    if (commodityId) {
      setTechnicalSymbolId(commodityId);
    }
    setPage(targetPage);
    setSidebarOpen(false);
    routerNavigate(pagePathById[targetPage]);
  }, [routerNavigate]);

  const navigate = (p: PageId) => goPage(p);

  const nav: NavContext = { exchangeId, technicalSymbolId, selectedProductName, goExchange, goTechnical, goProduct, goPage };

  return (
    <Ctx.Provider value={nav}>
      <div className="min-h-screen bg-ink-950 text-slate-200">
        <Sidebar current={page} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <TopBar
            title={meta.title}
            subtitle={meta.subtitle}
            onMenu={() => setSidebarOpen(true)}
            authOpen={authOpen}
            onAuthOpen={() => setAuthOpen(true)}
            onAuthClose={() => setAuthOpen(false)}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSettingsOpen={() => setSettingsOpen(true)}
            user={user}
          />
          <TickerBand />

          <main key={page} className="mx-auto max-w-7xl animate-fade-in px-4 py-5 lg:px-6 lg:py-6">
            {page === 'dashboard' && <Dashboard />}
            {page === 'commodities' && <Commodities />}
            {page === 'exchange' && <ExchangeDetail />}
            {page === 'compare' && <Compare />}
            {page === 'calculator' && <CalculatorPage />}
            {page === 'regions' && <Regions />}
            {page === 'livestock' && <LivestockPage />}
            {page === 'logistics' && <LogisticsPage />}
            {page === 'climate' && <ClimatePage />}
            {page === 'news' && <NewsPage />}
            {page === 'hal' && <HalPiyasalari />}
            {page === 'donation' && <DonationPage />}
            {page === 'advertise' && <AdvertisePage />}
            {page === 'privacy' && <LegalPages page="privacy" />}
            {page === 'terms' && <LegalPages page="terms" />}
            {page === 'contact' && <LegalPages page="contact" />}
          </main>

          <Footer />
        </div>

        {user && (
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            user={user}
            initialTheme={theme}
            onSave={handleSettingsSave}
            onDonate={() => {
              setSettingsOpen(false);
              goPage('donation');
            }}
            onLogout={handleLogout}
          />
        )}
      </div>
    </Ctx.Provider>
  );
}

export default App;
