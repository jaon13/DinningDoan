import glob, re

logs = glob.glob(r'C:\Users\User\.gemini\antigravity-ide\brain\78bb3cac-738f-440d-999e-9cda00814a90\.system_generated\logs\*.jsonl')
found = set()
for log in logs:
    with open(log, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            for m in re.findall(r'https://ldb-phinf\.pstatic\.net/[^"\'\s\\]+', line):
                if '...' not in m:
                    found.add(m)

print(f"Total valid pstatic image URLs found: {len(found)}")
with open('d:\\Johnny\\다이닝도안\\found_pstatic_urls.txt', 'w', encoding='utf-8') as f:
    for url in sorted(list(found)):
        print(url)
        f.write(url + '\n')
