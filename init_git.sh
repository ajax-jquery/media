#!/bin/bash

# 1. Generate tag secara otomatis dengan format YYYY-MM-DDTHH-MM-SS
newTag="v$(date +%Y-%m-%dT%H-%M-%S)"
echo -e "\e[35mMenggunakan tag otomatis: $newTag\e[0m"

# 2. Menambahkan dan melakukan commit[cite: 1]
git add .
git commit -m "Update $newTag"

# 3. Membuat tag[cite: 1]
git tag "$newTag"
echo -e "\e[32mTag $newTag berhasil dibuat!\e[0m" # Warna Hijau[cite: 1]

# 4. Menjalankan script Node.js (otomatis mendeteksi tag terakhir)[cite: 1]
node update-tag.js

# 5. Mengirim (Push) ke GitHub[cite: 1]
git push -u origin main

# 6. Mengirim Tag ke GitHub[cite: 1]
git push origin --tags

echo -e "\e[36mSelesai! Semua perubahan telah dikirim ke GitHub.\e[0m" # Warna Cyan[cite: 1]