import urllib.request
import json
import re

url = "https://html.duckduckgo.com/html/?q=%EB%8B%A4%EC%9D%B4%EB%8B%9D%EB%8F%84%EC%95%88+%ED%95%98%EB%8B%A8"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'https?://[^\s"\'<>]+(?:jpg|jpeg|png)', html)
    print("Found direct links:", len(links))
    for l in links[:5]:
        print(l)
except Exception as e:
    print("Error:", e)
