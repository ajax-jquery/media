#!/bin/bash

# 1. Meminta input dari pengguna di terminal
read -p "Masukkan nama tag baru (contoh: v1.0.1, atau tekan Enter jika tidak ingin membuat tag): " newTag

# 2. Menambahkan dan melakukan commit
git add .
# Jika newTag kosong, akan menggunakan pesan default "Update"
if [ -z "$newTag" ]; then
    git commit -m "Update"
else
    git commit -m "Update $newTag"
fi

# 3. Membuat tag JIKA pengguna memasukkan nama tag
if [ -n "$newTag" ]; then
    git tag "$newTag"
    echo -e "\e[32mTag $newTag berhasil dibuat!\e[0m" # Warna Hijau
else
    echo -e "\e[33mTidak ada tag baru yang dibuat. Menggunakan tag terakhir.\e[0m" # Warna Kuning
fi

# 4. Menjalankan script Node.js (otomatis mendeteksi tag terakhir)
node update-tag.js

# 5. Mengirim (Push) ke GitHub
git push -u origin main

# 6. Mengirim Tag ke GitHub JIKA ada tag baru
if [ -n "$newTag" ]; then
    git push origin --tags
fi

echo -e "\e[36mSelesai! Semua perubahan telah dikirim ke GitHub.\e[0m" # Warna Cyan