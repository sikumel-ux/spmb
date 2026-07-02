/**
 * FORM CLIENT CONTROLLER ENGINE
 * BERFUNGSI MENGAMBIL DATA FORMULIR DAN MENSINKRONISASIKANNYA KE LOCALSTORAGE DASHBOARD
 */
document.addEventListener("DOMContentLoaded", () => {
    const registrationForm = document.getElementById("mainPendaftaranForm");
    const LOCAL_DATABASE_KEY = "spmb_tunas_melati_submitted_data";

    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Mencegah reload halaman bawaan browser

        // 1. Ekstraksi Nilai Radio Jenis Kelamin yang Dipilih
        const selectedJk = document.querySelector('input[name="p_jk"]:checked').value;

        // 2. Kumpulkan Seluruh Isi Form Menjadi Satu Objek JSON Utuh
        const newStudentData = {
            id: Date.now(), // Generate Unique ID berbasis timestamp milidetik
            status: "Proses", // Default Status Awal data masuk
            
            // Kolom Anak
            p_nama: document.getElementById("p_nama").value.trim(),
            p_panggilan: document.getElementById("p_panggilan").value.trim(),
            p_jk: selectedJk,
            p_nik: document.getElementById("p_nik").value.trim(),
            p_kk: document.getElementById("p_kk").value.trim(),
            p_tempat_lahir: document.getElementById("p_tempat_lahir").value.trim(),
            p_tanggal_lahir: document.getElementById("p_tanggal_lahir").value,
            p_agama: document.getElementById("p_agama").value,
            p_anak_ke: parseInt(document.getElementById("p_anak_ke").value) || 1,
            p_saudara: parseInt(document.getElementById("p_saudara").value) || 1,
            p_alamat: document.getElementById("p_alamat").value.trim(),
            p_rt: document.getElementById("p_rt").value.trim(),
            p_rw: document.getElementById("p_rw").value.trim(),
            p_desa: document.getElementById("p_desa").value.trim(),
            p_kec: document.getElementById("p_kec").value.trim(),
            p_kota: document.getElementById("p_kota").value.trim(),
            p_prov: document.getElementById("p_prov").value.trim(),
            p_kodepos: document.getElementById("p_kodepos").value.trim(),
            p_goldar: document.getElementById("p_goldar").value,
            p_imunisasi: document.getElementById("p_imunisasi").value.trim() || "-",

            // Kolom Ayah
            a_nama: document.getElementById("a_nama").value.trim(),
            a_nik: document.getElementById("a_nik").value.trim(),
            a_hp: document.getElementById("a_hp").value.trim(),
            a_pekerjaan: document.getElementById("a_pekerjaan").value.trim(),
            a_penghasilan: document.getElementById("a_penghasilan").value,

            // Kolom Ibu
            i_nama: document.getElementById("i_nama").value.trim(),
            i_nik: document.getElementById("i_nik").value.trim(),
            i_hp: document.getElementById("i_hp").value.trim() || document.getElementById("a_hp").value.trim(),
            i_pekerjaan: document.getElementById("i_pekerjaan").value.trim(),
            i_penghasilan: document.getElementById("i_penghasilan").value
        };

        // 3. Ambil database lama dari LocalStorage, gabungkan dengan yang baru
        let databasePendaftar = [];
        const rawExistingData = localStorage.getItem(LOCAL_DATABASE_KEY);

        if (rawExistingData) {
            try {
                databasePendaftar = JSON.parse(rawExistingData);
            } catch (error) {
                console.error("Gagal membaca struktur database lokal lama, mereset...", error);
                databasePendaftar = [];
            }
        }

        // Masukkan data baru ke antrean teratas array
        databasePendaftar.unshift(newStudentData);

        // Simpan kembali array data yang baru ke LocalStorage
        localStorage.setItem(LOCAL_DATABASE_KEY, JSON.stringify(databasePendaftar));

        // 4. Tampilkan Notifikasi dan Reset Form Isian
        alert(`🎉 Pendaftaran Berhasil!\nData anak atas nama "${newStudentData.p_nama}" telah sukses dikirim ke sistem panitia.`);
        registrationForm.reset();
    });
});
