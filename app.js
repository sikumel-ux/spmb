document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("mainPendaftaranForm");
    const trackFields = document.querySelectorAll(".track-field");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("percentText");
    const DB_KEY = "spmb_tunas_melati_submitted_data";

    // Fungsi menghitung persentase form isian
    function updateFormProgress() {
        let filledCount = 0;
        trackFields.forEach(field => {
            if (field.value.trim() !== "") {
                filledCount++;
            }
        });

        const totalFields = trackFields.length;
        const currentPercentage = Math.round((filledCount / totalFields) * 100);
        
        // Update visual UI
        progressBar.style.width = currentPercentage + "%";
        percentText.innerText = currentPercentage + "%";
    }

    // Pasang listener real-time input ke setiap field tracker
    trackFields.forEach(field => {
        field.addEventListener("input", updateFormProgress);
        field.addEventListener("change", updateFormProgress);
    });

    // Proses Submit Form
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const selectedJk = document.querySelector('input[name="p_jk"]:checked').value;

        const record = {
            id: Date.now(),
            status: "Proses",
            p_nama: document.getElementById("p_nama").value.trim(),
            p_panggilan: document.getElementById("p_panggilan").value.trim(),
            p_jk: selectedJk,
            p_tempat_lahir: document.getElementById("p_tempat_lahir").value.trim(),
            p_tanggal_lahir: document.getElementById("p_tanggal_lahir").value,
            p_nik: document.getElementById("p_nik").value.trim(),
            p_kk: document.getElementById("p_kk").value.trim(),
            p_alamat: document.getElementById("p_alamat").value.trim(),
            a_nama: document.getElementById("a_nama").value.trim(),
            a_hp: document.getElementById("a_hp").value.trim(),
            i_nama: document.getElementById("i_nama").value.trim()
        };

        let currentDb = [];
        const existingData = localStorage.getItem(DB_KEY);
        if (existingData) {
            try { currentDb = JSON.parse(existingData); } catch(err) { currentDb = []; }
        }

        currentDb.unshift(record);
        localStorage.setItem(DB_KEY, JSON.stringify(currentDb));

        alert(`🎉 Berhasil!\nData pendaftaran ${record.p_nama} sudah tersimpan ke sistem admin.`);
        form.reset();
        updateFormProgress(); // Reset progress bar jadi 0% lagi
    });
});
