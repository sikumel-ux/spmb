/**
 * PPDB CORE ENGINE - VANILLA JAVASCRIPT MODULAR CODE
 * Fitur: Validasi Realtime, Auto-save LocalStorage, Searchable Dropdown, Dark Mode, Animasi.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- DATABASE PROVINSI (Untuk Searchable Dropdown) ---
    const daftarProvinsi = [
        "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
        "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
        "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta",
        "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
        "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
        "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
        "Maluku", "Maluku Utara", "Papua Barat", "Papua"
    ];

    // --- DOM ELEMENTS SELECTION ---
    const form = document.getElementById("ppdbForm");
    const provSearch = document.getElementById("provSearch");
    const provOptions = document.getElementById("provOptions");
    const provHidden = document.getElementById("provSiswa");
    const alamatTextarea = document.getElementById("alamatSiswa");
    const alamatCounter = document.getElementById("alamatCounter");
    const themeToggle = document.getElementById("themeToggle");
    const backToTopBtn = document.getElementById("backToTop");
    
    // Modal & Toast elements
    const previewModal = document.getElementById("previewModal");
    const confirmModal = document.getElementById("confirmModal");
    const previewContainer = document.getElementById("previewContainer");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const toastContainer = document.getElementById("toastContainer");

    // --- INITIALIZATION ---
    initTheme();
    setupScrollReveal();
    setupSearchableDropdown();
    setupCharCounter();
    setupAutoCapitalize();
    setupRippleEffect();
    loadFromLocalStorage();
    calculateProgress();

    // --- EVENT LISTENERS ---
    form.addEventListener("input", () => {
        saveToLocalStorage();
        calculateProgress();
    });

    // Validasi saat input kehilangan fokus (blur)
    form.querySelectorAll("input, select, textarea").forEach(element => {
        element.addEventListener("blur", () => validateField(element));
    });

    // Handle Upload File Preview Name
    document.querySelectorAll('.upload-box input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener("change", (e) => {
            const previewDiv = document.getElementById(`preview-${e.target.id}`);
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                // Validasi ukuran berkas (Max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showToast("Ukuran berkas melebihi 2MB!");
                    e.target.value = "";
                    previewDiv.innerText = "Belum ada file dipilih";
                    previewDiv.style.color = "var(--error-color)";
                } else {
                    previewDiv.innerText = ` Selected: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
                    previewDiv.style.color = "var(--emerald-dark)";
                }
            } else {
                previewDiv.innerText = "Belum ada file dipilih";
            }
            calculateProgress();
        });
    });

    // Form Action Buttons Actions
    document.getElementById("btnReset").addEventListener("click", resetFormDenganKonfirmasi);
    document.getElementById("btnPreview").addEventListener("click", bukaPreviewModal);
    document.getElementById("closePreview").addEventListener("click", () => previewModal.classList.remove("active"));
    document.getElementById("btnEditKembali").addEventListener("click", () => previewModal.classList.remove("active"));
    document.getElementById("btnCancelSubmit").addEventListener("click", () => confirmModal.classList.remove("active"));
    document.getElementById("btnFinalSubmit").addEventListener("click", eksekusiSubmitAkhir);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validateAllFields()) {
            confirmModal.classList.add("active");
        } else {
            showToast("⚠️ Mohon lengkapi semua field wajib dengan benar!");
            // Scroll ke element error pertama
            const firstError = document.querySelector(".has-error");
            if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    // Theme Toggle Trigger
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("ppdb-theme", newTheme);
        themeToggle.innerHTML = newTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Back To Top Window Scroll Event
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add("active");
        } else {
            backToTopBtn.classList.remove("active");
        }
    });
    backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));


    // ==========================================================================
    // CORE FUNCTIONS LOGIC ARCHITECTURE
    // ==========================================================================

    // --- SEARCHABLE DROPDOWN FUNCTION ---
    function setupSearchableDropdown() {
        // Render item list pertama kali
        daftarProvinsi.forEach(prov => {
            const div = document.createElement("div");
            div.classList.add("search-option-item");
            div.innerText = prov;
            div.addEventListener("click", () => {
                provSearch.value = prov;
                provHidden.value = prov;
                provOptions.classList.remove("active");
                validateField(provSearch);
                saveToLocalStorage();
                calculateProgress();
            });
            provOptions.appendChild(div);
        });

        provSearch.addEventListener("focus", () => provOptions.classList.add("active"));
        
        // Filter Pencarian
        provSearch.addEventListener("input", (e) => {
            const filter = e.target.value.toLowerCase();
            const items = provOptions.querySelectorAll(".search-option-item");
            items.forEach(item => {
                if (item.innerText.toLowerCase().includes(filter)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });

        // Close dropdown jika klik di luar area komponen
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".dropdown-searchable")) {
                provOptions.classList.remove("active");
            }
        });
    }

    // --- CHARACTER COUNTER ---
    function setupCharCounter() {
        alamatTextarea.addEventListener("input", () => {
            const len = alamatTextarea.value.length;
            alamatCounter.innerText = len;
        });
    }

    // --- AUTO CAPITALIZE HURUF AWAL NAMA ---
    function setupAutoCapitalize() {
        document.querySelectorAll(".auto-capitalize").forEach(input => {
            input.addEventListener("keyup", (e) => {
                let kata = e.target.value.split(' ');
                for (let i = 0; i < kata.length; i++) {
                    kata[i] = kata[i].charAt(0).toUpperCase() + kata[i].slice(1);
                }
                e.target.value = kata.join(' ');
            });
        });
    }

    // --- VALIDATION ENGINE ---
    function validateField(element) {
        if (!element.hasAttribute('required') && element.value.trim() === "") {
            clearError(element);
            return true;
        }

        const parent = element.closest(".form-group") || element.closest(".upload-box");
        let isValid = true;
        let errMsg = "Field ini wajib diisi";

        // Cek dasar jika kosong
        if (element.hasAttribute('required') && (!element.value || element.value.trim() === "")) {
            isValid = false;
        } else {
            // Validasi Kondisional Khusus Aturan Bisnis Admin Sekolah
            if (element.id === "nikSiswa" || element.id === "kkSiswa" || element.id === "nikAyah" || element.id === "nikIbu") {
                if (!/^\d{16}$/.test(element.value)) {
                    isValid = false;
                    errMsg = "Data harus berupa angka & tepat 16 digit";
                }
            }
            else if (element.type === "tel" || element.id === "hpAyah" || element.id === "hpIbu" || element.id === "hpDarurat") {
                if (!/^\d+$/.test(element.value)) {
                    isValid = false;
                    errMsg = "Nomor HP hanya boleh berisi angka";
                }
            }
            else if (element.type === "email") {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value)) {
                    isValid = false;
                    errMsg = "Format email tidak valid (ex: nama@domain.com)";
                }
            }
            else if (element.type === "date") {
                const inputDate = new Date(element.value);
                const today = new Date();
                if (inputDate > today) {
                    isValid = false;
                    errMsg = "Tanggal tidak boleh melebihi hari ini";
                }
            }
            else if (element.id === "provSearch" && !provHidden.value) {
                isValid = false;
                errMsg = "Silakan pilih salah satu provinsi dari daftar";
            }
        }

        if (!isValid && parent) {
            showFieldError(parent, element, errMsg);
        } else if (parent) {
            clearError(parent);
        }

        return isValid;
    }

    function showFieldError(parent, element, message) {
        parent.classList.add("has-error");
        let errDiv = parent.querySelector(".error-message");
        if (!errDiv) {
            errDiv = document.createElement("div");
            errDiv.classList.add("error-message");
            parent.appendChild(errDiv);
        }
        errDiv.innerText = message;
    }

    function clearError(parent) {
        parent.classList.remove("has-error");
        const errDiv = parent.querySelector(".error-message");
        if (errDiv) errDiv.remove();
    }

    function validateAllFields() {
        let isFormValid = true;
        form.querySelectorAll("input, select, textarea").forEach(input => {
            // Abaikan input pencarian dummy dropdown
            if(input.id === "provSearch") {
                if(!validateField(input)) isFormValid = false;
            } else {
                if(!validateField(input)) isFormValid = false;
            }
        });
        return isFormValid;
    }

    // --- PROGRESS BAR CALCULATION ---
    function calculateProgress() {
        const requiredInputs = form.querySelectorAll("input[required], select[required], textarea[required]");
        let filledCount = 0;

        requiredInputs.forEach(input => {
            if (input.type === "file") {
                if (input.files.length > 0) filledCount++;
            } else if (input.value && input.value.trim() !== "") {
                filledCount++;
            }
        });

        const percentage = requiredInputs.length > 0 ? Math.round((filledCount / requiredInputs.length) * 100) : 0;
        document.getElementById("formProgressBar").style.width = `${percentage}%`;
        document.getElementById("formProgressText").innerText = `Pengisian: ${percentage}%`;
    }

    // --- LOCAL STORAGE MANAGER (AUTO SAVE & RESTORE) ---
    function saveToLocalStorage() {
        const formData = {};
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.type !== "file" && input.type !== "checkbox") {
                formData[input.id || input.name] = input.value;
            }
        });
        localStorage.setItem("ppdb-autosave-data", JSON.stringify(formData));
    }

    function loadFromLocalStorage() {
        const savedData = localStorage.getItem("ppdb-autosave-data");
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key) || document.getElementsByName(key)[0];
                if (element && element.type !== "file") {
                    element.value = data[key];
                }
            });
            // Singkronisasi isian teks pencarian provinsi jika ada data tersembunyi
            if(provHidden.value) provSearch.value = provHidden.value;
            
            // Trigger counter alamat aktual jika terisi
            if(alamatTextarea.value) alamatCounter.innerText = alamatTextarea.value.length;
        }
    }

    // --- RESET ACTION ---
    function resetFormDenganKonfirmasi() {
        if (confirm("Apakah Anda yakin ingin menghapus seluruh isian formulir?")) {
            form.reset();
            localStorage.removeItem("ppdb-autosave-data");
            document.querySelectorAll(".file-preview").forEach(p => p.innerText = "Belum ada file dipilih");
            alamatCounter.innerText = "0";
            form.querySelectorAll(".form-group").forEach(g => g.classList.remove("has-error"));
            document.querySelectorAll(".error-message").forEach(e => e.remove());
            calculateProgress();
            window.scrollTo({ top: 0, behavior: "smooth" });
            showToast("🔄 Formulir berhasil di-reset ke kondisi awal");
        }
    }

    // --- PREVIEW SYSTEM DIALOG ---
    function bukaPreviewModal() {
        // Render tabel dinamis data yang sudah diisi
        let html = '<table class="preview-table"><thead><tr><th>Field Data</th><th>Isi Input</th></tr></thead><tbody>';
        
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if(input.id && input.id !== "provSearch" && input.type !== "file") {
                const labelElement = document.querySelector(`label[for="${input.id}"]`);
                const labelText = labelElement ? labelElement.innerText.replace('*','').trim() : input.id;
                const valueText = input.value ? input.value : "-";
                html += `<tr><td><strong>${labelText}</strong></td><td>${valueText}</td></tr>`;
            }
        });

        // Dapatkan berkas ter-upload nama saja
        form.querySelectorAll("input[type='file']").forEach(fileInput => {
            const labelElement = fileInput.closest('.upload-box').querySelector('label');
            const labelText = labelElement ? labelElement.innerText.replace('*','').trim() : 'Berkas';
            const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "Belum di-upload";
            html += `<tr><td><strong>${labelText}</strong></td><td><i class="fas fa-file"></i> ${fileName}</td></tr>`;
        });

        html += '</tbody></table>';
        previewContainer.innerHTML = html;
        previewModal.classList.add("active");
    }

    // --- FINAL SUBMIT PROCESS EXECUTION ---
    function eksekusiSubmitAkhir() {
        confirmModal.classList.remove("active");
        previewModal.classList.remove("active");
        loadingOverlay.classList.add("active");

        // Simulasi pengiriman data Ajax Request ke Server Sekolah
        setTimeout(() => {
            loadingOverlay.classList.remove("active");
            showToast("🎉 Pendaftaran Anda BERHASIL Dikirim ke Database!");
            form.reset();
            localStorage.removeItem("ppdb-autosave-data");
            calculateProgress();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000); // loading animation 3 detik
    }

    // --- SYSTEM UTILITIES (Toast, Theme, Ripple, Scroll Reveal) ---
    function showToast(message) {
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span class="toast-text">${message}</span>`;
        toastContainer.appendChild(toast);
        
        // Hapus otomatis toast setelah beberapa saat
        setTimeout(() => {
            toast.style.animation = "slideUp 0.3s ease reverse forwards";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem("ppdb-theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        themeToggle.innerHTML = savedTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function setupScrollReveal() {
        const elements = document.querySelectorAll(".scroll-reveal");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        }, { threshold: 0.05 });

        elements.forEach(el => observer.observe(el));
    }

    function setupRippleEffect() {
        document.querySelectorAll(".ripple").forEach(button => {
            button.addEventListener("click", function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const wave = document.createElement("span");
                wave.classList.add("ripple-wave");
                wave.style.left = `${x}px`;
                wave.style.top = `${y}px`;
                
                this.appendChild(wave);
                setTimeout(() => wave.remove(), 600);
            });
        });
    }
});
