# ✅ سكربت لتوحيد أسماء الصور وتحديث الإشارات في الكود
# الكاتب: ChatGPT × جلال 😎

# حدد الامتدادات اللي عايز تعالجها
$imgExtensions = @("jpg", "jpeg", "png", "gif", "webp")

# هتدوّر في كل الصور في المشروع
$allImages = Get-ChildItem -Recurse -Include $($imgExtensions | ForEach-Object {"*.$_"})

foreach ($img in $allImages) {
    $oldName = $img.Name
    $newName = $oldName.ToLower()

    if ($oldName -ne $newName) {
        Write-Host "🔄 إعادة تسمية: $oldName → $newName"
        Rename-Item $img.FullName $newName -Force

        # تحديث الإشارات داخل ملفات الكود
        Get-ChildItem -Recurse -Include *.html, *.js, *.css | ForEach-Object {
            (Get-Content $_.FullName -Raw) -replace [regex]::Escape($oldName), $newName |
                Set-Content $_.FullName -Encoding UTF8
        }
    }
}

Write-Host "✅ All image names converted to lowercase and code updated successfully!"

