import os

files = [
    r'd:\Johnny\다이닝도안\webapp\src\App.svelte',
    r'd:\Johnny\다이닝도안\tistory_skin\skin.html',
    r'd:\Johnny\다이닝도안\naver_blog_final_package\실제_네이버블로그_적용_매뉴얼.md'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            text = fp.read()
        text = text.replace('1068480543', '1059460378')
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(text)
        print(f"Updated: {f}")
