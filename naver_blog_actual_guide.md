# [다이닝도안] 네이버 블로그 실제 적용 패키지

실제 네이버 블로그에 바로 적용하실 수 있도록 **(1) 상단 스킨 & 투명 위젯 HTML 코드**, **(2) 스마트에디터 ONE 포스팅 복사/붙여넣기용 본문 텍스트 & 태그**, **(3) 이미지 리소스 경로**를 정리했습니다.

---

## 1. 네이버 블로그 실제 등록용 이미지 파일 위치
다운로드된 고화질 원본 파일이 프로젝트 내 [`d:\Johnny\다이닝도안\naver_blog_assets`](file:///d:/Johnny/다이닝도안/naver_blog_assets) 폴더에 저장되어 있습니다.

* **상단 와이드 스킨 배경 (2000px)**: [wide_skin_background.png](file:///d:/Johnny/다이닝도안/naver_blog_assets/wide_skin_background.png)
* **공식 프로필 로고 엠블럼**: [logo_profile.png](file:///d:/Johnny/다이닝도안/naver_blog_assets/logo_profile.png)
* **포스팅용 제철 숙성 모둠 사시미 컷**: [sashimi_signature.png](file:///d:/Johnny/다이닝도안/naver_blog_assets/sashimi_signature.png)
* **포스팅용 문경바람 오크 페어링 주류 컷**: [pairing_liquor.png](file:///d:/Johnny/다이닝도안/naver_blog_assets/pairing_liquor.png)
* **포스팅용 한우 타르타르 & 감자전 컷**: [tartare_dish.png](file:///d:/Johnny/다이닝도안/naver_blog_assets/tartare_dish.png)

---

## 2. 네이버 블로그 상단 5대 투명 위젯 소스 코드
네이버 블로그 관리자 페이지(`관리 > 꾸미기 설정 > 레이아웃·위젯 설정 > 위젯 직접등록`)에서 등록할 수 있는 5개 메뉴 코드입니다.

> **가로 폭 규격**: 각 위젯당 가로 170px, 세로 500~600px

### 위젯 1: BRAND STORY (브랜드 스토리)
```html
<a href="https://blog.naver.com/YOUR_ID?categoryNo=YOUR_CATEGORY_1" target="_top">
  <img src="https://via.placeholder.com/170x500/000000/000000.png?text=+" width="170" height="500" border="0" style="opacity:0;" alt="BRAND STORY" />
</a>
```

### 위젯 2: SIGNATURE MENU (시그니처 메뉴)
```html
<a href="https://blog.naver.com/YOUR_ID?categoryNo=YOUR_CATEGORY_2" target="_top">
  <img src="https://via.placeholder.com/170x500/000000/000000.png?text=+" width="170" height="500" border="0" style="opacity:0;" alt="SIGNATURE MENU" />
</a>
```

### 위젯 3: LOCATION & HOURS (오시는 길 & 매장 안내)
```html
<a href="https://blog.naver.com/YOUR_ID?categoryNo=YOUR_CATEGORY_3" target="_top">
  <img src="https://via.placeholder.com/170x500/000000/000000.png?text=+" width="170" height="500" border="0" style="opacity:0;" alt="LOCATION" />
</a>
```

### 위젯 4: NAVER RESERVATION (실시간 네이버 예약)
```html
<a href="https://map.naver.com/p/entry/place/YOUR_NAVER_PLACE_ID" target="_blank">
  <img src="https://via.placeholder.com/170x500/000000/000000.png?text=+" width="170" height="500" border="0" style="opacity:0;" alt="NAVER RESERVATION" />
</a>
```

### 위젯 5: INSTAGRAM (공식 인스타그램)
```html
<a href="https://www.instagram.com/dining_doan" target="_blank">
  <img src="https://via.placeholder.com/170x500/000000/000000.png?text=+" width="170" height="500" border="0" style="opacity:0;" alt="INSTAGRAM" />
</a>
```

---

## 3. 스마트에디터 ONE 실제 포스팅 원고 (그대로 복사해 글쓰기에 붙여넣기)

### [글 제목]
`[시그니처 테이스팅] 제철 숙성 모둠 사시미 8종과 문경바람 오크 전통주 페어링 나잇 | 다이닝도안`

---

### [본문 내용]

#### 1. 인용구 블록 (인용구 기능 선택 - 버티컬 라인)
> "제철의 가장 농밀한 기름기를 머금은 어종만을 선별하여, 24시간 도안만의 독자적인 저온 숙성법을 거쳐 찰기와 감칠맛을 극대화했습니다. 여기에 사과 증류주의 오크 숙성 향이 깃든 '문경바람 오크' 한 잔이 더해져 비로소 완벽한 밤의 미식이 완성됩니다."  
> — 다이닝도안 총괄 셰프 & 마스터 소믈리에

---

#### 2. 첫 번째 사진 첨부 (sashimi_signature.png)
*(사진 하단 캡션: 도안의 시그니처, 장인 도자기 플레이트에 정갈하게 담아낸 당일 제철 숙성 모둠 사시미 8종)*

**[Chapter 01. 엄선된 어종의 깊이 — 저온 숙성 모둠 사시미]**  
안녕하세요, 맛과 멋이 공존하는 감성 다이닝 & 요리주점 **'다이닝도안'**입니다.  

오늘 소개해 드릴 메뉴는 도안을 찾아주시는 많은 고객분들께서 가장 먼저 찾아주시는 시그니처, **'제철 저온 숙성 모둠 사시미'**입니다.  

도안에서는 당일 새벽 산지에서 직송된 최상급 원물만을 취급하며, 어종마다 최적의 숙성 시간과 온도를 달리하여 각 생선 본연의 깊은 풍미를 끌어올리고 있습니다.

* **참돔 유비끼 (마츠카와)**: 껍질의 차진 식감과 은은하게 퍼지는 지방의 단맛
* **대삼치 볏짚 훈연**: 은은한 볏짚 스모키 향과 부드럽게 녹아내리는 육질
* **완도산 대광어 & 엔가와**: 24시간 다시마 숙성을 거쳐 차진 감칠맛
* **남해안 줄전갱이 (시마아지)**: 특유의 녹진하고 고소한 풍미
* **생참치 혼마구로 뱃살**: 극상의 마블링과 입안 가득 퍼지는 고소한 풍미
* **동해 단새우 & 통영 참문어 숙회**: 쫀득한 단맛과 부드러운 식감의 조화

💡 **셰프의 추천 TIP**:  
첫 점은 신안 갯벌 토판염에 살짝 찍어 본연의 단맛을 느껴보시고, 생와사비와 도안 수제 다시마 간장을 곁들여 드시면 한층 더 깊은 풍미를 즐기실 수 있습니다.

---

#### 3. 두 번째 사진 첨부 (pairing_liquor.png)
*(사진 하단 캡션: 문경 사과를 증류해 프렌치 오크통에서 300일 이상 숙성한 '문경바람 오크 40'과 크리스털 카빙 온더락 잔)*

**[Chapter 02. 전통주의 품격 — 문경바람 오크 40도 페어링]**  
기름진 숙성 사시미와 밸런스를 맞추기 위해 엄선한 이번 달의 페어링 주류는 **'문경바람 오크 40도'**입니다.

* **AROMA**: 달콤한 바닐라 향과 싱그러운 사과꽃, 그을린 참나무 향의 레이어
* **PALATE**: 40도의 고도주임에도 벨벳처럼 부드럽고 매끄러운 목넘김
* **FINISH**: 숙성 사시미의 담백한 지방을 깔끔하게 씻어내 주는 기품 있는 긴 여운

사과 증류 원액이 오크통을 거치며 완성된 은은한 황금빛과 부드러운 산미가 숙성회의 담백함과 어우러져 완벽한 마리아주를 선사합니다.

---

#### 4. 세 번째 사진 첨부 (wide_skin_background.png)
*(사진 하단 캡션: 차분한 차콜 톤과 은은한 황동 조명이 어우러진 다이닝도안 메인 바 카운터)*

**[Chapter 03. 공간이 주는 위로 — 프라이빗 바 카운터 & 룸]**  
도안은 소중한 사람과의 대화에 온전히 집중하실 수 있도록 조도와 음악, 좌석 간격을 세심하게 설계했습니다.

* 조용하게 잔을 기울이며 요리를 감상할 수 있는 **메인 바 카운터석 (2인 특화)**
* 가족 외식 및 프라이빗한 모임을 위한 **독립 부스석 및 프라이빗 룸 (4~8인 완비)**

---

#### 5. 네이버 스마트플레이스 장소 첨부 (글쓰기 상단 '장소' 버튼 클릭)
* **장소명**: 다이닝도안 (하단본점 / 명지직영점)
* **운영 시간**: 월~토 17:30 - 01:00 (라스트오더 00:00 / 매주 일요일 정기휴무)
* **주차 안내**: 매장 건물 전용 주차장 2시간 무료 지원
* **예약 안내**: 네이버 실시간 예약 및 캐치테이블 예약 가능 (당일 예약은 유선 문의 권장)

---

#### 6. 추천 해시태그 (포스팅 하단 태그 입력창)
`#다이닝도안 #하단맛집 #명지맛집 #부산다이닝바 #부산요리주점 #숙성사시미맛집 #문경바람오크 #전통주페어링 #부산데이트코스 #부산분위기좋은술집`
