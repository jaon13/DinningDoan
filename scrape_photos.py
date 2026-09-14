import urllib.request
import re

urls = [
    'https://m.place.naver.com/restaurant/1068480543/home',
    'https://m.place.naver.com/restaurant/1068480543/photo',
    'https://m.place.naver.com/restaurant/1068480543/menu'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

all_imgs = set()
for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        found = re.findall(r'https://ldb-phinf\.pstatic\.net/[^"\'\s\\]+', html)
        found += re.findall(r'https://pup-review-phinf\.pstatic\.net/[^"\'\s\\]+', html)
        found += re.findall(r'https://search\.pstatic\.net/[^"\'\s\\]+', html)
        for img in found:
            img = img.replace('\\u002F', '/')
            all_imgs.add(img)
    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(f"Total unique images found: {len(all_imgs)}")
with open('d:\\Johnny\\다이닝도안\\scraped_images.txt', 'w', encoding='utf-8') as f:
    for img in sorted(list(all_imgs)):
        f.write(img + '\n')
