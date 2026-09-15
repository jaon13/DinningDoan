<script>
  import { onMount } from 'svelte';
  import { bindScrollProgress, bindReveals, bindCardTilt, bindHeroParallax } from './lib/motion.js';
  import { isBranchOpen, statusLabel } from './lib/hours.js';

  const HeroAtmosphere = import('./lib/HeroAtmosphere.svelte').then((m) => m.default);

  // Navigation Links
  const NAV_LINKS = [
    { name: '브랜드 스토리', href: '#story' },
    { name: '시그니처 메뉴', href: '#menu' },
    { name: '지점 안내 & 예약', href: '#locations' },
    { name: '공식 블로그', href: 'https://blog.naver.com', external: true },
  ];

  // Branches Data (하단본점 & 명지직영점)
  // 공통: 17:30–01:00 / 하단 일요일 휴무, 명지 일요일 운영
  const BRANCHES = [
    {
      id: 'hadan',
      name: '하단본점 (도안 1호점)',
      badge: '본점',
      address: '부산광역시 사하구 낙동남로1423번길 139 1층 (하단역 1번 출구 도보 3분)',
      hours: '월~토 17:30 - 01:00 (라스트오더 00:00 / 매주 일요일 휴무)',
      phone: '0507-1336-6161',
      parking: '전용 주차타워 2시간 무료 지원 (신동아 주차장 인근)',
      placeId: '1059460378',
      schedule: { openMinutes: 17 * 60 + 30, closeMinutes: 60, closedWeekdays: [0] }
    },
    {
      id: 'myeongji',
      name: '명지직영점 (도안 2호점)',
      badge: '직영점',
      address: '부산광역시 강서구 명지국제2로28번길 7 (명지국제신도시)',
      hours: '월~토 17:30 - 01:00 (라스트오더 00:00 / 일요일 운영)',
      phone: '010-3667-9386',
      parking: '건물 지하 주차장 완비 / 무료 주차 지원',
      placeId: '2060161064',
      schedule: { openMinutes: 17 * 60 + 30, closeMinutes: 60, closedWeekdays: [] }
    }
  ];

  let nowTick = Date.now();
  $: branchStatuses = Object.fromEntries(
    BRANCHES.map((b) => {
      const open = isBranchOpen(b.schedule, new Date(nowTick));
      return [b.id, statusLabel(open)];
    })
  );
  $: anyOpen = BRANCHES.some((b) => branchStatuses[b.id]?.open);
  $: siteStatus = statusLabel(anyOpen);

  // PC: pcmap.place / Mobile viewport: m.place
  let isMobileViewport = false;
  function placeUrl(placeId, path) {
    const host = isMobileViewport
      ? 'https://m.place.naver.com'
      : 'https://pcmap.place.naver.com';
    return `${host}/restaurant/${placeId}/${path}`;
  }

  // Naver Place CDN (ldb-phinf) — hotlinked hero/story stills (not served from public/)
  // 하단본점 1059460378 / 명지직영점 2060161064
  const PLACE_IMG = {
    hadanBar:
      'https://ldb-phinf.pstatic.net/20251102_77/1762073169573XAV1g_JPEG/DSC01198.jpg',
    hadanTable:
      'https://ldb-phinf.pstatic.net/20251102_247/1762073173601k2rC4_JPEG/DSC01229.jpg',
    myeongjiSignature:
      'https://ldb-phinf.pstatic.net/20260115_89/1768407740411KkrAW_JPEG/DSC01270.jpg',
    fallbackDish:
      'https://ldb-phinf.pstatic.net/20250924_245/1758723705193vCvmI_JPEG/DSC01162_%281%29.jpg',
  };

  function menuListUrl(placeId) {
    return isMobileViewport
      ? placeUrl(placeId, 'menu')
      : placeUrl(placeId, 'menu/list');
  }

  // Full menu from Naver Place (synced → public/place-menu.json via npm run sync:menu)
  const MENU_CATEGORIES = ['전체', '시그니처 사시미', '한우 일품', '국물 & 요리', '전통주 페어링'];
  let activeCategory = '전체';
  let activeMenuPlace = 'hadan';
  let menuSyncedAt = '';
  /** @type {Record<string, any>} */
  let placeMenus = {};
  let menuLoadError = '';

  $: activePlaceMenu = placeMenus[activeMenuPlace] || null;
  $: dishes = activePlaceMenu?.dishes || [];
  $: filteredDishes =
    activeCategory === '전체' ? dishes : dishes.filter((d) => d.category === activeCategory);

  function dishImage(dish) {
    return dish?.image || PLACE_IMG.fallbackDish;
  }

  /** @type {HTMLElement} */
  let pageRoot;
  /** @type {HTMLElement} */
  let heroSection;
  /** @type {HTMLElement} */
  let heroMedia;
  let isScrolled = false;
  let menuOpen = false;

  function closeMenu() {
    menuOpen = false;
  }

  /** Svelte action: shallow 3D tilt + spotlight */
  function tilt(node) {
    const destroy = bindCardTilt(node);
    return { destroy };
  }

  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 40;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const unbindProgress = bindScrollProgress((p) => {
      document.documentElement.style.setProperty('--scroll-progress', String(p));
    });

    const unbindReveals = bindReveals(pageRoot || document);
    const unbindParallax =
      heroMedia && heroSection ? bindHeroParallax(heroMedia, heroSection) : () => {};

    const mq = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => {
      isMobileViewport = mq.matches;
    };
    syncViewport();
    mq.addEventListener('change', syncViewport);

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const syncMenu = () => {
      if (desktopMq.matches) menuOpen = false;
    };
    syncMenu();
    desktopMq.addEventListener('change', syncMenu);

    const statusTimer = setInterval(() => {
      nowTick = Date.now();
    }, 60_000);

    fetch('./place-menu.json')
      .then((r) => {
        if (!r.ok) throw new Error(`menu json ${r.status}`);
        return r.json();
      })
      .then((data) => {
        placeMenus = data.places || {};
        menuSyncedAt = data.syncedAt || '';
        if (data.defaultPlace && placeMenus[data.defaultPlace]) {
          activeMenuPlace = data.defaultPlace;
        }
      })
      .catch((err) => {
        menuLoadError = '네이버 메뉴를 불러오지 못했습니다. npm run sync:menu 후 새로고침하세요.';
        console.warn(err);
      });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unbindProgress();
      unbindReveals();
      unbindParallax();
      mq.removeEventListener('change', syncViewport);
      desktopMq.removeEventListener('change', syncMenu);
      clearInterval(statusTimer);
    };
  });
</script>

<div
  bind:this={pageRoot}
  class="min-h-screen bg-[#121215] text-[#f5f5f7] selection:bg-[#d4af37] selection:text-[#121215]"
>
  <div class="scroll-progress" aria-hidden="true"></div>

  <!-- 1. Floating Top Glass Navigation -->
  <header class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || menuOpen ? 'bg-[#1a1a1e]/95 backdrop-blur-md border-b border-[#d4af37]/20 py-3 shadow-2xl' : 'bg-transparent py-4 sm:py-5'}`}>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
      <a href="#top" class="flex items-center gap-2 sm:gap-3 group min-w-0" on:click={closeMenu}>
        <img src="/logo_profile.png" alt="다이닝도안 로고" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#d4af37]/60 group-hover:scale-105 transition-transform shrink-0" />
        <div class="min-w-0">
          <span class="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#d4af37]">다이닝도안</span>
          <span class="hidden xl:inline-block text-[10px] tracking-[0.25em] text-stone-400 ml-2 uppercase">Dining Doan</span>
        </div>
      </a>

      <!-- Desktop / large tablet Nav Links -->
      <nav class="hidden lg:flex items-center gap-6 xl:gap-8">
        {#each NAV_LINKS as link}
          <a 
            href={link.href} 
            target={link.external ? '_blank' : '_self'}
            class="text-sm font-medium tracking-wider text-stone-300 hover:text-[#d4af37] transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#d4af37] hover:after:w-full after:transition-all"
          >
            {link.name}
          </a>
        {/each}
      </nav>

      <div class="flex items-center gap-2 shrink-0">
        <a 
          href="#locations"
          on:click={closeMenu}
          class="inline-flex items-center gap-1.5 sm:gap-2 bg-[#03C75A] hover:bg-[#02b150] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2.5 rounded-full shadow-lg shadow-[#03C75A]/25 hover:shadow-[#03C75A]/40 transition-all duration-200"
        >
          <span class="font-mono font-black text-sm">N</span>
          <span class="sm:hidden">예약</span>
          <span class="hidden sm:inline">지점별 실시간 예약</span>
        </a>

        <!-- Mobile / tablet menu toggle -->
        <button
          type="button"
          class="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#d4af37]/30 bg-[#1a1a1e]/80 text-[#d4af37]"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          on:click={() => (menuOpen = !menuOpen)}
        >
          {#if menuOpen}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          {/if}
        </button>
      </div>
    </div>

    {#if menuOpen}
      <nav class="lg:hidden border-t border-[#d4af37]/15 bg-[#1a1a1e]/98 backdrop-blur-md">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col">
          {#each NAV_LINKS as link}
            <a
              href={link.href}
              target={link.external ? '_blank' : '_self'}
              on:click={closeMenu}
              class="py-3.5 text-sm font-medium tracking-wider text-stone-200 border-b border-stone-800/80 last:border-0 hover:text-[#d4af37] transition-colors"
            >
              {link.name}
            </a>
          {/each}
        </div>
      </nav>
    {/if}
  </header>

  <!-- 2. Hero Visual Section -->
  <section
    id="top"
    bind:this={heroSection}
    class="relative min-h-[100svh] sm:min-h-[90vh] sm:h-[90vh] flex items-center justify-center overflow-hidden pb-28 sm:pb-0"
  >
    <!-- Ambient Background with Overlay -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <div bind:this={heroMedia} class="hero-media absolute inset-[-4%] will-change-transform">
        <img src={PLACE_IMG.hadanBar} alt="다이닝도안 하단본점 바 카운터 (네이버 플레이스)" class="w-full h-full object-cover object-center filter brightness-[0.62] contrast-110" referrerpolicy="no-referrer" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/55 to-black/45"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/12 via-transparent to-transparent"></div>
      <!-- Curve accent fragment (site language; Three.js stays secondary) -->
      <svg class="curve-accent curve-accent--hero" viewBox="0 0 320 120" fill="none" aria-hidden="true">
        <path d="M8 88 C 70 18, 150 8, 220 42 C 270 66, 300 78, 312 72" stroke="currentColor" stroke-width="1.25" />
        <path d="M28 102 C 90 42, 170 28, 240 58 C 280 76, 300 88, 312 96" stroke="currentColor" stroke-width="0.75" opacity="0.55" />
      </svg>
    </div>

    {#await HeroAtmosphere then Atmosphere}
      <Atmosphere />
    {/await}

    <!-- Hero Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center mt-16 sm:mt-12">
      <div class="hero-enter inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 sm:px-4 py-1.5 rounded-full bg-[#2a2a30]/80 border border-[#d4af37]/30 text-[#d4af37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-5 sm:mb-6 backdrop-blur-md">
        <span>Busan Modern Gastropub</span>
        <span class="w-1 h-1 rounded-full bg-[#d4af37]"></span>
        <span>하단본점 & 명지직영점</span>
      </div>

      <h1 class="hero-enter hero-enter-delay-1 font-serif text-[1.75rem] leading-snug sm:text-5xl md:text-6xl font-normal sm:leading-[1.25] tracking-tight mb-5 sm:mb-6 text-white drop-shadow-2xl">
        맛과 멋이 공존하는<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f7e099] to-[#d4af37] font-semibold">
          밤의 미식 예술, 다이닝도안
        </span>
      </h1>

      <p class="hero-enter hero-enter-delay-2 text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-8 sm:mb-10 px-1">
        차게 숙성된 회와, 숨 고른 한우.<br class="hidden sm:inline" />
        황동빛 아래 고요히 열리는 밤의 식탁.
      </p>

      <div class="hero-enter hero-enter-delay-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
        <a 
          href="#locations" 
          class="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#d4af37] hover:bg-[#c6923c] text-[#121215] font-bold text-sm md:text-base tracking-wider transition-all duration-200 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-3"
        >
          <span>지점 선택 후 바로 예약하기</span>
          <span class="text-lg font-mono">↓</span>
        </a>
        <a 
          href="#menu" 
          class="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-md bg-[#1a1a1e]/80 hover:bg-[#2a2a30] text-[#f5f5f7] border border-[#d4af37]/30 text-sm md:text-base font-medium tracking-wider transition-colors backdrop-blur-sm text-center"
        >
          시그니처 메뉴 살펴보기
        </a>
      </div>
    </div>

    <!-- Quick Info Pill Bar at bottom of Hero -->
    <div class="hero-enter hero-enter-delay-4 absolute bottom-4 sm:bottom-6 left-0 right-0 z-10 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto bg-[#1a1a1e]/85 border border-[#d4af37]/20 rounded-xl py-3 px-4 sm:px-6 backdrop-blur-md flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-around gap-2.5 sm:gap-4 text-xs sm:text-sm text-stone-300">
        <div class="flex items-center gap-2">
          <span
            class={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] sm:text-xs font-bold tracking-wider ${
              siteStatus.open
                ? 'bg-[#03C75A]/15 border-[#03C75A]/40 text-[#03C75A]'
                : 'bg-stone-800/80 border-stone-600 text-stone-300'
            }`}
          >
            <span class={`w-1.5 h-1.5 rounded-full ${siteStatus.open ? 'bg-[#03C75A]' : 'bg-stone-500'}`}></span>
            {siteStatus.en}
            <span class="font-medium opacity-80">· {siteStatus.ko}</span>
          </span>
        </div>
        <div class="hidden sm:inline w-[1px] h-3 bg-stone-700"></div>
        <div class="flex items-center gap-2">
          <span class="text-[#d4af37]" aria-hidden="true">●</span>
          <span>하단본점 (사하구 낙동남로)</span>
          <span class={`text-[10px] font-bold ${branchStatuses.hadan.open ? 'text-[#03C75A]' : 'text-stone-500'}`}>
            {branchStatuses.hadan.en}
          </span>
        </div>
        <div class="hidden sm:inline w-[1px] h-3 bg-stone-700"></div>
        <div class="flex items-center gap-2">
          <span class="text-[#d4af37]" aria-hidden="true">●</span>
          <span>명지직영점 (강서구 명지국제2로)</span>
          <span class={`text-[10px] font-bold ${branchStatuses.myeongji.open ? 'text-[#03C75A]' : 'text-stone-500'}`}>
            {branchStatuses.myeongji.en}
          </span>
        </div>
      </div>
    </div>
  </section>

  <div class="px-4 sm:px-6 -mt-2 mb-2" aria-hidden="true">
    <div class="curve-divider">
      <svg viewBox="0 0 480 40" fill="none" preserveAspectRatio="none">
        <path d="M0 28 C 80 8, 160 4, 240 18 C 320 32, 400 34, 480 14" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </div>
  </div>

  <!-- 3. Brand Story Section -->
  <section id="story" class="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
    <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
      <div class="relative reveal">
        <svg class="curve-accent curve-accent--story" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <path d="M10 90 A 55 55 0 0 1 100 40" stroke="currentColor" stroke-width="1.2" />
          <path d="M22 98 A 48 48 0 0 1 98 52" stroke="currentColor" stroke-width="0.7" opacity="0.5" />
        </svg>
        <div class="curve-media aspect-[4/3] border border-[#d4af37]/30 shadow-2xl">
          <!-- Real Original Dish Photo -->
          <img src={PLACE_IMG.myeongjiSignature} alt="도안사시미 실물 원본 (네이버 플레이스 명지)" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerpolicy="no-referrer" />
        </div>
      </div>

      <div class="space-y-5 sm:space-y-6 reveal reveal-delay-1">
        <span class="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold block">Craft & Philosophy</span>
        <h2 class="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-tight">
          "타협하지 않는 원물 선별,<br />시간이 빚어낸 녹진한 감칠맛"
        </h2>
        <div class="curve-rule" aria-hidden="true">
          <svg viewBox="0 0 72 12" fill="none">
            <path d="M2 9 C 18 2, 36 2, 54 7 C 60 9, 66 10, 70 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <p class="text-stone-400 text-sm sm:text-base leading-relaxed">
          도안은 매일 새벽 부산 자갈치와 산지에서 직송되는 최상급 어종만을 사용합니다. 
          생선마다 다른 지방 분포도에 맞추어 저온 다시마 숙성과 볏짚 훈연을 거쳐, 생선 고유의 차진 식감과 감칠맛을 가장 완벽한 온도에서 대접합니다.
        </p>
        <p class="text-stone-400 text-sm sm:text-base leading-relaxed">
          하단본점에 이어 명지직영점까지 동일한 셰프의 장인정신과 레시피로 운영되며, 소중한 사람과 나누는 밤의 대화를 더욱 특별하게 만듭니다.
        </p>
        <div class="pt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 sm:gap-y-2 text-stone-300 text-xs">
          <div>✓ 당일 도축 1++ 한우 취급</div>
          <div>✓ 완벽한 2인 특화 카운터석</div>
          <div>✓ 단체 프라이빗 룸 완비</div>
        </div>
      </div>
    </div>
  </section>

  <div class="px-4 sm:px-6 my-1" aria-hidden="true">
    <div class="curve-divider">
      <svg viewBox="0 0 480 40" fill="none" preserveAspectRatio="none">
        <path d="M0 28 C 80 8, 160 4, 240 18 C 320 32, 400 34, 480 14" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </div>
  </div>

  <!-- 4. Interactive Menu Showcase — Naver Place full menu -->
  <section id="menu" class="py-16 sm:py-20 md:py-24 bg-[#16161a] relative overflow-hidden">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" aria-hidden="true"></div>
    <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" aria-hidden="true"></div>
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto mb-8 sm:mb-10 reveal">
        <span class="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold block mb-2">Artisanal Dining Menu</span>
        <h2 class="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white">네이버 플레이스 전체 메뉴</h2>
        <p class="text-stone-400 text-sm mt-3">
          플레이스에 등록된 메뉴를 그대로 불러옵니다. 국물·짬뽕·일품까지 카테고리별로 살펴보세요.
        </p>
        {#if menuSyncedAt}
          <p class="text-[10px] text-stone-600 mt-2 font-mono">synced {menuSyncedAt.slice(0, 19).replace('T', ' ')} · npm run sync:menu</p>
        {/if}
      </div>

      <!-- Branch toggle -->
      <div class="flex items-center justify-center gap-2 mb-5 reveal">
        {#each BRANCHES as b}
          <button
            type="button"
            on:click={() => { activeMenuPlace = b.id; activeCategory = '전체'; }}
            class={`px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide min-h-[40px] transition-colors border ${
              activeMenuPlace === b.id
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                : 'bg-transparent border-stone-700 text-stone-400 hover:border-[#d4af37]/40 hover:text-stone-200'
            }`}
          >
            {b.id === 'hadan' ? '하단본점' : '명지직영점'}
          </button>
        {/each}
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {#each MENU_CATEGORIES as cat}
          <button
            type="button"
            on:click={() => (activeCategory = cat)}
            class={`shrink-0 px-4 py-2.5 text-xs md:text-sm rounded-full transition-all duration-200 font-medium min-h-[40px] ${activeCategory === cat ? 'bg-[#d4af37] text-[#121215] font-bold shadow-lg shadow-[#d4af37]/20' : 'bg-[#1a1a1e] text-stone-400 border border-stone-800 hover:border-[#d4af37]/40 hover:text-white'}`}
          >
            {cat}
            {#if cat !== '전체' && dishes.length}
              <span class="opacity-70 ml-1">({dishes.filter((d) => d.category === cat).length})</span>
            {/if}
          </button>
        {/each}
      </div>

      {#if menuLoadError}
        <p class="text-center text-sm text-amber-500/90 mb-8">{menuLoadError}</p>
      {/if}

      <!-- Menu Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {#each filteredDishes as dish (dish.id)}
          <a
            href={menuListUrl(dish.placeId)}
            target="_blank"
            rel="noopener noreferrer"
            use:tilt
            class="tilt-card curve-card bg-[#1a1a1e] border border-stone-800/80 hover:border-[#d4af37]/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col text-left"
          >
            <div class="curve-card-media aspect-[16/10] overflow-hidden relative bg-[#121215]">
              <img
                src={dishImage(dish)}
                alt={dish.name}
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                referrerpolicy="no-referrer"
                loading="lazy"
              />
              <div class="absolute top-3 left-3 right-3 flex flex-wrap gap-1">
                {#if dish.recommend}
                  <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-[#d4af37] font-semibold border border-[#d4af37]/30">추천</span>
                {/if}
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-stone-300 font-semibold border border-stone-600/50">{dish.category}</span>
              </div>
            </div>

            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start mb-2">
                  <h3 class="font-serif text-base sm:text-lg font-semibold text-white leading-snug">{dish.name}</h3>
                  <span class="font-mono text-sm font-bold text-[#d4af37] sm:ml-2 shrink-0">{dish.price}</span>
                </div>
                {#if dish.desc}
                  <p class="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-3">{dish.desc}</p>
                {/if}
              </div>

              <div class="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <span class="text-stone-500">네이버 메뉴판</span>
                <span class="text-[#03C75A] font-bold">자세히 보기 →</span>
              </div>
            </div>
          </a>
        {:else}
          {#if !menuLoadError}
            <p class="col-span-full text-center text-stone-500 text-sm py-8">이 카테고리에 표시할 메뉴가 없습니다.</p>
          {/if}
        {/each}

        <!-- 메뉴 더보기 — 네이버 플레이스 전체 메뉴판 -->
        <div
          use:tilt
          class="tilt-card curve-card bg-[#1a1a1e] border border-stone-800/80 hover:border-[#d4af37]/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col"
        >
          <div class="curve-card-media aspect-[16/10] overflow-hidden relative bg-gradient-to-br from-[#1f1f24] via-[#1a1a1e] to-[#121215] flex items-center justify-center">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_65%)]" aria-hidden="true"></div>
            <div class="relative text-center px-4">
              <span class="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/80 font-semibold block mb-2">Naver Place Menu</span>
              <p class="font-serif text-2xl sm:text-3xl text-white/90">메뉴 더보기</p>
            </div>
          </div>

          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
            <p class="text-stone-400 text-xs leading-relaxed">
              전체 메뉴·가격·메뉴판 이미지는 네이버 플레이스에서 확인할 수 있습니다.
            </p>

            <div class="flex flex-col gap-2">
              <a
                href={menuListUrl(BRANCHES[0].placeId)}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-3 rounded bg-[#d4af37] hover:bg-[#c4a030] text-[#121215] font-bold text-sm transition-colors flex items-center justify-center min-h-[44px]"
              >
                하단본점 메뉴 더보기
              </a>
              <a
                href={menuListUrl(BRANCHES[1].placeId)}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2.5 text-center text-xs text-stone-400 hover:text-[#d4af37] transition-colors min-h-[40px] flex items-center justify-center"
              >
                명지직영점 메뉴 보기 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="px-4 sm:px-6 my-1" aria-hidden="true">
    <div class="curve-divider">
      <svg viewBox="0 0 480 40" fill="none" preserveAspectRatio="none">
        <path d="M0 28 C 80 8, 160 4, 240 18 C 320 32, 400 34, 480 14" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </div>
  </div>

  <!-- 5. Branches & Reservation Section (하단본점 + 명지직영점 2개 지점 분기) -->
  <section id="locations" class="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
    <div class="text-center max-w-2xl mx-auto mb-8 sm:mb-12 reveal">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#03C75A]/10 border border-[#03C75A]/30 text-[#03C75A] text-[10px] sm:text-xs font-bold mb-3">
        <span>LOCATIONS & NAVER RESERVATION</span>
      </div>
      <h2 class="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white">매장 안내 및 네이버 실시간 예약</h2>
      <p class="text-stone-400 text-sm mt-3">방문하시고자 하는 지점을 선택하시면 해당 매장의 네이버 예약 및 지도 길찾기로 즉시 연결됩니다.</p>
    </div>

    <!-- Branch Selection Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
      {#each BRANCHES as branch}
        <div class="loc-glow reveal bg-[#1a1a1e] border border-[#d4af37]/25 hover:border-[#d4af37] p-5 sm:p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4 gap-2">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold border border-[#d4af37]/40">
                  {branch.badge}
                </span>
                <span
                  class={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider border ${
                    branchStatuses[branch.id].open
                      ? 'bg-[#03C75A]/15 border-[#03C75A]/40 text-[#03C75A]'
                      : 'bg-stone-800 border-stone-600 text-stone-400'
                  }`}
                >
                  {branchStatuses[branch.id].en}
                </span>
              </div>
              <span class="hidden sm:inline text-xs text-stone-400 font-mono">Naver Place ID: {branch.placeId}</span>
            </div>

            <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-4">{branch.name}</h3>

            <div class="space-y-3 text-xs sm:text-sm text-stone-300 font-light mb-6 sm:mb-8">
              <div class="flex items-start gap-3">
                <span class="text-[#d4af37] font-bold shrink-0 w-14 sm:w-auto">주소</span>
                <span class="break-keep">{branch.address}</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-[#d4af37] font-bold shrink-0 w-14 sm:w-auto">영업시간</span>
                <span class="break-keep">
                  {branch.hours}
                  <span class={`ml-2 font-semibold ${branchStatuses[branch.id].open ? 'text-[#03C75A]' : 'text-stone-500'}`}>
                    · {branchStatuses[branch.id].ko}
                  </span>
                </span>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-[#d4af37] font-bold shrink-0 w-14 sm:w-auto">전화문의</span>
                <a href={`tel:${branch.phone.replace(/-/g, '')}`} class="text-white hover:text-[#d4af37] underline font-medium">
                  {branch.phone}
                </a>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-[#d4af37] font-bold shrink-0 w-14 sm:w-auto">주차안내</span>
                <span class="break-keep">{branch.parking}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons for this branch -->
          <div class="space-y-2 pt-4 border-t border-stone-800">
            <a 
              href={placeUrl(branch.placeId, 'booking')} 
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3.5 rounded bg-[#03C75A] hover:bg-[#02b150] text-white font-bold text-sm shadow-lg shadow-[#03C75A]/20 transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span class="font-mono font-black">N</span>
              <span>{branch.name.split(' ')[0]} 네이버 실시간 예약하기</span>
            </a>

            <div class="grid grid-cols-2 gap-2">
              <a 
                href={placeUrl(branch.placeId, 'location')} 
                target="_blank"
                rel="noopener noreferrer"
                class="py-3 sm:py-2.5 rounded bg-[#2a2a30] hover:bg-[#33333b] text-stone-200 border border-stone-700 text-xs font-medium transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                네이버 지도 길찾기
              </a>
              <a 
                href={placeUrl(branch.placeId, 'menu')} 
                target="_blank"
                rel="noopener noreferrer"
                class="py-3 sm:py-2.5 rounded bg-[#2a2a30] hover:bg-[#33333b] text-stone-200 border border-stone-700 text-xs font-medium transition-colors text-center min-h-[44px] flex items-center justify-center"
              >
                전체 메뉴판 보기
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- 6. Footer -->
  <footer class="relative border-t border-stone-800/80 bg-[#0e0e11] py-10 sm:py-12 px-4 sm:px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
    <svg class="curve-accent curve-accent--footer" viewBox="0 0 320 40" fill="none" aria-hidden="true">
      <path d="M0 28 C 70 8, 140 6, 160 18 C 180 30, 250 32, 320 12" stroke="currentColor" stroke-width="1.1" />
    </svg>
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-stone-500">
      <div class="flex items-start sm:items-center gap-3">
        <img src="/logo_profile.png" alt="다이닝도안" class="w-8 h-8 rounded-full border border-stone-700 shrink-0" />
        <div class="min-w-0">
          <span class="font-serif text-sm font-bold text-stone-300 block">다이닝도안 (Dining Doan)</span>
          <span class="block mt-1 leading-relaxed">하단본점: 부산 사하구 낙동남로1423번길 139</span>
          <span class="block leading-relaxed">명지직영점: 부산 강서구 명지국제2로28번길 7</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 sm:gap-6">
        <a href="https://blog.naver.com" target="_blank" rel="noopener noreferrer" class="hover:text-[#03C75A] transition-colors min-h-[44px] inline-flex items-center">공식 네이버 블로그</a>
        <a href="https://www.instagram.com/dining_doan" target="_blank" rel="noopener noreferrer" class="hover:text-[#d4af37] transition-colors min-h-[44px] inline-flex items-center">인스타그램</a>
      </div>
    </div>
    <div class="text-center text-[11px] text-stone-600 mt-8">
      Copyright © DINING DOAN. All Rights Reserved. Modern Avant-Garde Gastropub.
    </div>
  </footer>
</div>
