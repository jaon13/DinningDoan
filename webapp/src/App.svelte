<script>
  import { onMount } from 'svelte';

  // Navigation Links
  const NAV_LINKS = [
    { name: '브랜드 스토리', href: '#story' },
    { name: '시그니처 메뉴', href: '#menu' },
    { name: '공간 & 페어링', href: '#pairing' },
    { name: '오시는 길', href: '#location' },
    { name: '공식 블로그', href: 'https://blog.naver.com', external: true },
  ];

  // Menu Data
  const MENU_CATEGORIES = ['전체', '시그니처 사시미', '한우 일품', '국물 & 요리', '전통주 페어링'];
  let activeCategory = '전체';

  const DISHES = [
    {
      id: 1,
      category: '시그니처 사시미',
      name: '도안 제철 숙성 모둠사시미 (4시미)',
      price: '48,000원',
      desc: '새벽 산지 직송 당일 선별 어종 8종. 24시간 저온 숙성으로 찰기와 감칠맛을 극대화한 도안 대표 메뉴.',
      tags: ['대표메뉴', '저온숙성', '제철생선'],
      image: '/sashimi_signature.png',
      pairing: '문경바람 오크 40°'
    },
    {
      id: 2,
      category: '한우 일품',
      name: '한우 1++ 차돌박이 육사시미',
      price: '38,000원',
      desc: '당일 도축 최상급 1++ 한우 차돌박이만을 엄선. 특제 마늘 기름장과 생와사비의 극상 마리아주.',
      tags: ['주문1위', '한우투뿔', '한정수량'],
      image: '/tartare_dish.png',
      pairing: '화요 25°'
    },
    {
      id: 3,
      category: '한우 일품',
      name: '한우 타르타르 & 트러플 바삭 감자전',
      price: '29,000원',
      desc: '바삭하게 채 썰어 부친 감자전 위에 신선한 한우 타르타르와 생 트러플을 갈아 올린 미식 전채.',
      tags: ['셰프추천', '트러플', '인기폭발'],
      image: '/tartare_dish.png',
      pairing: '서울의 밤'
    },
    {
      id: 4,
      category: '국물 & 요리',
      name: '도안 불향 차돌짬뽕',
      price: '24,000원',
      desc: '진한 한우 사골 베이스 육수에 푸짐한 차돌박이와 불향 가득한 채소를 볶아낸 도안의 밤을 깨우는 탕.',
      tags: ['해장필수', '얼큰불향', '식사겸용'],
      image: '/wide_skin_background.png',
      pairing: '일품진로 25°'
    },
    {
      id: 5,
      category: '전통주 페어링',
      name: '문경바람 오크 40° 페어링 세트',
      price: '55,000원',
      desc: '문경 사과 증류 원액을 프렌치 오크통에서 숙성. 카빙 아이스볼 크리스털 잔과 함께 제공.',
      tags: ['프리미엄', '오크숙성', '사과증류주'],
      image: '/pairing_liquor.png',
      pairing: '숙성 사시미 추천'
    }
  ];

  $: filteredDishes = activeCategory === '전체' 
    ? DISHES 
    : DISHES.filter(d => d.category === activeCategory);

  // Scrolled State for Glass Navbar
  let isScrolled = false;
  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 40;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Simple Reservation Modal State
  let showModal = false;
  let resName = '';
  let resPhone = '';
  let resDate = '';
  let resPeople = '2';

  function handleQuickBooking() {
    // Direct redirect to Naver Booking for 100% verified real reservations
    window.open('https://m.place.naver.com/restaurant/1068480543/booking', '_blank');
  }
</script>

<div class="min-h-screen bg-[#121215] text-[#f5f5f7] selection:bg-[#d4af37] selection:text-[#121215]">
  <!-- 1. Floating Top Glass Navigation -->
  <header class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1a1a1e]/90 backdrop-blur-md border-b border-[#d4af37]/20 py-3 shadow-2xl' : 'bg-transparent py-5'}`}>
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3 group">
        <img src="/logo_profile.png" alt="다이닝도안" class="w-10 h-10 rounded-full border border-[#d4af37]/60 group-hover:scale-105 transition-transform" />
        <div>
          <span class="font-serif text-xl font-bold tracking-wider text-[#d4af37]">다이닝도안</span>
          <span class="hidden md:inline-block text-[10px] tracking-[0.25em] text-stone-400 ml-2 uppercase">Dining Doan</span>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <nav class="hidden md:flex items-center gap-8">
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

      <!-- Naver Direct Booking CTA -->
      <div class="flex items-center gap-3">
        <a 
          href="https://m.place.naver.com/restaurant/1068480543/booking" 
          target="_blank"
          class="inline-flex items-center gap-2 bg-[#03C75A] hover:bg-[#02b150] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-full shadow-lg shadow-[#03C75A]/25 hover:shadow-[#03C75A]/40 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <span class="font-mono font-black text-sm">N</span>
          <span>네이버 실시간 예약</span>
        </a>
      </div>
    </div>
  </header>

  <!-- 2. Hero Visual Section -->
  <section class="relative h-[90vh] min-h-[640px] flex items-center justify-center overflow-hidden">
    <!-- Ambient Background with Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="/wide_skin_background.png" alt="다이닝도안 내부 인테리어" class="w-full h-full object-cover scale-105 filter brightness-75 contrast-110" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/60 to-black/40"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-transparent to-transparent"></div>
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center mt-12">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a2a30]/80 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-md">
        <span>Busan Modern Gastropub</span>
        <span class="w-1 h-1 rounded-full bg-[#d4af37]"></span>
        <span>하단본점 & 명지직영점</span>
      </div>

      <h1 class="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.25] tracking-tight mb-6 text-white drop-shadow-2xl">
        맛과 멋이 공존하는<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f7e099] to-[#d4af37] font-semibold">
          밤의 미식 예술, 다이닝도안
        </span>
      </h1>

      <p class="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-10">
        당일 새벽 산지 직송 숙성 사시미와 최상급 1++ 한우 차돌사시미.<br class="hidden sm:inline" />
        은은한 황동 조명이 감싸는 프라이빗 카운터에서 깊이 있는 전통주 페어링을 경험하세요.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a 
          href="https://m.place.naver.com/restaurant/1068480543/booking" 
          target="_blank"
          class="w-full sm:w-auto px-8 py-4 rounded-md bg-[#d4af37] hover:bg-[#c6923c] text-[#121215] font-bold text-sm md:text-base tracking-wider transition-all duration-200 shadow-xl shadow-[#d4af37]/20 flex items-center justify-center gap-3"
        >
          <span>네이버 실시간 예약하기</span>
          <span class="text-lg font-mono">→</span>
        </a>
        <a 
          href="#menu" 
          class="w-full sm:w-auto px-8 py-4 rounded-md bg-[#1a1a1e]/80 hover:bg-[#2a2a30] text-[#f5f5f7] border border-[#d4af37]/30 text-sm md:text-base font-medium tracking-wider transition-colors backdrop-blur-sm"
        >
          시그니처 메뉴 살펴보기
        </a>
      </div>
    </div>

    <!-- Quick Info Pill Bar at bottom of Hero -->
    <div class="absolute bottom-6 left-0 right-0 z-10 px-6">
      <div class="max-w-4xl mx-auto bg-[#1a1a1e]/80 border border-[#d4af37]/20 rounded-xl py-3 px-6 backdrop-blur-md flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm text-stone-300">
        <div class="flex items-center gap-2">
          <span class="text-[#d4af37]">🕒</span>
          <span>월~토 17:30 - 01:00 (일 휴무)</span>
        </div>
        <div class="hidden sm:inline w-[1px] h-3 bg-stone-700"></div>
        <div class="flex items-center gap-2">
          <span class="text-[#d4af37]">📍</span>
          <span>부산 사하구 하단역 1번 출구 280m</span>
        </div>
        <div class="hidden sm:inline w-[1px] h-3 bg-stone-700"></div>
        <div class="flex items-center gap-2">
          <span class="text-[#d4af37]">🅿️</span>
          <span>전용 주차타워 2시간 무료 지원</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. Brand Story Section -->
  <section id="story" class="py-24 px-6 max-w-5xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12 items-center">
      <div class="relative">
        <div class="aspect-[4/3] rounded-lg overflow-hidden border border-[#d4af37]/30 shadow-2xl">
          <img src="/sashimi_signature.png" alt="도안 시그니처 사시미 플레이팅" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </div>
        <div class="absolute -bottom-6 -right-6 hidden sm:block bg-[#1a1a1e] border border-[#d4af37] p-4 rounded shadow-2xl text-center">
          <span class="block text-2xl font-bold font-serif text-[#d4af37]">24h</span>
          <span class="text-[11px] text-stone-400 uppercase tracking-widest">Low-Temp Aged</span>
        </div>
      </div>

      <div class="space-y-6">
        <span class="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold block">Craft & Philosophy</span>
        <h2 class="font-serif text-3xl sm:text-4xl font-normal text-white leading-tight">
          "타협하지 않는 원물 선별,<br />시간이 빚어낸 녹진한 감칠맛"
        </h2>
        <div class="w-12 h-[2px] bg-[#d4af37]"></div>
        <p class="text-stone-400 text-sm sm:text-base leading-relaxed">
          도안은 매일 새벽 부산 자갈치와 산지에서 직송되는 최상급 어종만을 사용합니다. 
          생선마다 다른 지방 분포도에 맞추어 저온 다시마 숙성과 볏짚 훈연을 거쳐, 생선 고유의 차진 식감과 감칠맛을 가장 완벽한 온도에서 대접합니다.
        </p>
        <p class="text-stone-400 text-sm sm:text-base leading-relaxed">
          여기에 셰프가 엄선한 국내 최고의 프리미엄 전통주와 증류식 소주 페어링이 더해져, 소중한 사람과 나누는 밤의 대화를 더욱 특별하게 만듭니다.
        </p>
        <div class="pt-2 flex gap-6 text-stone-300 text-xs">
          <div>✓ 당일 도축 1++ 한우 취급</div>
          <div>✓ 완벽한 2인 특화 카운터석</div>
          <div>✓ 단체 프라이빗 룸 완비</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. Interactive Menu Showcase -->
  <section id="menu" class="py-24 bg-[#16161a] border-y border-[#d4af37]/15">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold block mb-2">Artisanal Dining Menu</span>
        <h2 class="font-serif text-3xl sm:text-4xl font-normal text-white">도안의 시그니처 미식 큐레이션</h2>
        <p class="text-stone-400 text-sm mt-3">신선한 식재료 본연의 맛을 정갈한 현대적 한식 터치로 풀어낸 대표 요리들입니다.</p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-12">
        {#each MENU_CATEGORIES as cat}
          <button 
            on:click={() => activeCategory = cat}
            class={`px-4 py-2 text-xs md:text-sm rounded-full transition-all duration-200 font-medium ${activeCategory === cat ? 'bg-[#d4af37] text-[#121215] font-bold shadow-lg shadow-[#d4af37]/20' : 'bg-[#1a1a1e] text-stone-400 border border-stone-800 hover:border-[#d4af37]/40 hover:text-white'}`}
          >
            {cat}
          </button>
        {/each}
      </div>

      <!-- Menu Grid Cards -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredDishes as dish (dish.id)}
          <div class="bg-[#1a1a1e] border border-stone-800/80 hover:border-[#d4af37]/60 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 flex flex-col">
            <div class="aspect-[16/10] overflow-hidden relative">
              <img src={dish.image} alt={dish.name} class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <div class="absolute top-3 left-3 flex gap-1">
                {#each dish.tags as tag}
                  <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-[#d4af37] font-semibold border border-[#d4af37]/30">
                    {tag}
                  </span>
                {/each}
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-serif text-lg font-semibold text-white leading-snug">{dish.name}</h3>
                  <span class="font-mono text-sm font-bold text-[#d4af37] ml-2 shrink-0">{dish.price}</span>
                </div>
                <p class="text-stone-400 text-xs leading-relaxed mb-4">{dish.desc}</p>
              </div>

              <div class="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <span class="flex items-center gap-1.5">
                  <span class="text-[#d4af37]">🍶 페어링:</span>
                  <strong class="text-stone-300">{dish.pairing}</strong>
                </span>
                <a 
                  href="https://m.place.naver.com/restaurant/1068480543/booking" 
                  target="_blank"
                  class="text-[#03C75A] font-bold hover:underline"
                >
                  예약하기 →
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Naver Place Full Menu Link -->
      <div class="text-center mt-12">
        <a 
          href="https://m.place.naver.com/restaurant/1068480543/menu" 
          target="_blank"
          class="inline-flex items-center gap-2 text-xs md:text-sm text-stone-300 hover:text-[#d4af37] border border-stone-700 hover:border-[#d4af37] px-6 py-3 rounded-full transition-colors"
        >
          <span>네이버 플레이스에서 전체 메뉴 & 주류 리스트 확인하기</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  </section>

  <!-- 5. Naver Real-Time Location & Integration -->
  <section id="location" class="py-24 px-6 max-w-6xl mx-auto">
    <div class="bg-[#1a1a1e] border border-[#d4af37]/25 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div class="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#03C75A]/10 border border-[#03C75A]/30 text-[#03C75A] text-xs font-bold mb-4">
            <span>NAVER SMART PLACE</span>
          </div>

          <h2 class="font-serif text-3xl font-semibold text-white mb-4">
            다이닝도안 하단본점 안내
          </h2>
          <p class="text-stone-400 text-sm mb-6 leading-relaxed">
            부산 사하구 하단동 동아대 먹자골목 중심에 위치하고 있습니다. 
            차분하고 세련된 조도의 다찌 카운터와 프라이빗 룸이 마련되어 있어 소중한 모임에 최적화되어 있습니다.
          </p>

          <div class="space-y-3 text-sm text-stone-300 mb-8 font-light">
            <div class="flex items-start gap-3">
              <span class="text-[#d4af37] font-bold">주소</span>
              <span>부산광역시 사하구 낙동남로1423번길 139 1층 (하단역 1번 출구 도보 3분)</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-[#d4af37] font-bold">영업시간</span>
              <span>월~토 17:30 - 01:00 (라스트오더 00:00 / 매주 일요일 정기휴무)</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-[#d4af37] font-bold">전화문의</span>
              <a href="tel:050713366161" class="text-white hover:text-[#d4af37] underline">0507-1336-6161</a>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-[#d4af37] font-bold">주차안내</span>
              <span>매장 전용 주차타워 2시간 무료 지원 (신동아 주차장 인근)</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <a 
              href="https://m.place.naver.com/restaurant/1068480543/booking" 
              target="_blank"
              class="px-6 py-3 rounded bg-[#03C75A] hover:bg-[#02b150] text-white font-bold text-sm shadow-lg shadow-[#03C75A]/20 transition-all flex items-center gap-2"
            >
              <span>[N] 네이버 실시간 예약</span>
            </a>
            <a 
              href="https://m.place.naver.com/restaurant/1068480543/location" 
              target="_blank"
              class="px-6 py-3 rounded bg-[#2a2a30] hover:bg-[#33333b] text-stone-200 border border-stone-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>네이버 지도 길찾기</span>
            </a>
            <a 
              href="tel:050713366161" 
              class="px-6 py-3 rounded bg-transparent hover:bg-stone-800 text-[#d4af37] border border-[#d4af37]/40 text-sm font-medium transition-colors"
            >
              전화 걸기
            </a>
          </div>
        </div>

        <!-- Visual Map Preview Card -->
        <div class="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-stone-700/60 shadow-xl group">
          <img src="/wide_skin_background.png" alt="다이닝도안 매장 위치 안내" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
            <span class="text-[#03C75A] text-xs font-mono font-bold">NAVER MAP REAL-TIME</span>
            <span class="font-serif text-lg text-white font-bold">다이닝도안 하단본점 (도안 1호점)</span>
            <span class="text-stone-300 text-xs">클릭하시면 네이버 내비게이션으로 바로 연결됩니다</span>
          </div>
          <a href="https://m.place.naver.com/restaurant/1068480543/location" target="_blank" class="absolute inset-0"></a>
        </div>
      </div>
    </div>
  </section>

  <!-- 6. Footer -->
  <footer class="border-t border-stone-800/80 bg-[#0e0e11] py-12 px-6">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500">
      <div class="flex items-center gap-3">
        <img src="/logo_profile.png" alt="다이닝도안" class="w-8 h-8 rounded-full border border-stone-700" />
        <div>
          <span class="font-serif text-sm font-bold text-stone-300 block">다이닝도안 (Dining Doan)</span>
          <span>대표: 도안 | 사업자등록번호: 214-88-01923 | 부산광역시 사하구 낙동남로1423번길 139</span>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <a href="https://blog.naver.com" target="_blank" class="hover:text-[#03C75A] transition-colors">공식 네이버 블로그</a>
        <a href="https://www.instagram.com/dining_doan" target="_blank" class="hover:text-[#d4af37] transition-colors">인스타그램</a>
        <a href="https://m.place.naver.com/restaurant/1068480543/booking" target="_blank" class="hover:text-white transition-colors">네이버 예약</a>
      </div>
    </div>
    <div class="text-center text-[11px] text-stone-600 mt-8">
      Copyright © DINING DOAN. All Rights Reserved. Modern Avant-Garde Gastropub.
    </div>
  </footer>
</div>
