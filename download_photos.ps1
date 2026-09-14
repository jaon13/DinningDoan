$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    'Referer' = 'https://m.place.naver.com/'
}

$images = @{
    'interior_mood.jpg' = 'https://ldb-phinf.pstatic.net/20250924_174/17587186333642hQpC_JPEG/DSC01185_%C3%DF%B0%A1%BA%B8%C1%A4.jpg'
    'sashimi_platter.jpg' = 'https://ldb-phinf.pstatic.net/20250924_298/1758718633340thmgj_JPEG/DSC01252_%C3%DF%B0%A1%BA%B8%C1%A4.jpg'
    'chef_cooking.jpg' = 'https://ldb-phinf.pstatic.net/20250924_189/1758718633324f9E3N_JPEG/DSC01217_%C3%DF%B0%A1%BA%B8%C1%A4.jpg'
    'bar_counter.jpg' = 'https://ldb-phinf.pstatic.net/20250924_64/1758718633323UfIh3_JPEG/DSC01198_%C3%DF%B0%A1%BA%B8%C1%A4.jpg'
    'table_seat.jpg' = 'https://ldb-phinf.pstatic.net/20250924_250/1758718633290MLlvv_JPEG/DSC01229_%C3%DF%B0%A1%BA%B8%C1%A4.jpg'
}

foreach ($name in $images.Keys) {
    $url = $images[$name]
    $dest1 = "webapp\public\$name"
    $dest2 = "tistory_skin\images\$name"
    $dest3 = "naver_blog_final_package\images\$name"
    
    Invoke-WebRequest -Uri $url -Headers $headers -OutFile $dest1
    Copy-Item $dest1 $dest2 -Force
    Copy-Item $dest1 $dest3 -Force
    $size = (Get-Item $dest1).Length
    Write-Host "Success: $name -> $size bytes"
}
