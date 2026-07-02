/**
 * SISTEM ENGINE PPDB KORPORAT - VANILLA JAVASCRIPT MODULAR
 * Fitur: Validasi Realtime, Auto-save LocalStorage, Searchable Dropdown, Dark Mode, Animasi Reveal.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- DATABASE PROVINSI ---
    const daftarProvinsi = [
        "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
        "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
        "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta",
        "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
        "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
        "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
        "Maluku", "Maluku Utara", "Papua Barat", "Papua"
    ];

    // --- SELEKSI DOM UTAMA ---
    const form = document.getElementById("ppdbForm");
    const provSearch = document.getElementById("provSearch");
    const provOptions = document.getElementById("provOptions");
    const provHidden = document.getElementById("provSiswa");
    const alamatTextarea = document.getElementById("alamatSiswa");
    const alamatCounter = document.getElementById("alamatCounter");
    const themeToggle = document.getElementById("themeToggle");
    const backToTopBtn = document.getElementById("backToTop");
    
    // Overlays Modals & Toasts
    const previewModal = document.getElementById("previewModal");
    const confirmModal = document.getElementById("confirmModal");
    const previewContainer = document.getElementById("previewContainer");
    const loadingOverlay = document.getElementById("loadingOverlay");
    const toastContainer = document.getElementById("toastContainer");

    // --- INISIALISASI ENGINE ---
    initTheme();
    setupScrollReveal();
    setupSearchableDropdown();
    setupCharCounter();
    setupAutoCapitalize();
    setupRippleEffect();
    loadFromLocalStorage();
    calculateProgress();

    // --- REGISTRASI LISTENERS EVENT ---
    form.addEventListener("input", () => {
        saveToLocalStorage();
        calculateProgress();
    });

    // Validasi Instan Saat Kursor Meninggalkan Field (Blur)
    form.querySelectorAll("input, select, textarea").forEach(inputElement => {
        inputElement.addEventListener("blur", () => validateField(inputElement));
    });

    // Validasi File Upload & Preview Nama File Berkas Digital
    document.querySelectorAll('.compact-upload-box input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener("change", (e) => {
            const previewDiv = document.getElementById(`preview-${e.target.id}`);
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                // Limit Berkas 2MB
                if (file.size > 2 * 1024 * 1024) {
                    showToast("⚠️ Ukuran berkas melebihi batas maksimal 2MB!");
                    e.target.value = "";
                    previewDiv.innerText = "Belum ada berkas";
                    previewDiv.style.color = "var(--error-color)";
                } else {
                    previewDiv.innerText = ` ${file.name.substring(0, 18)}... (${(file.size/1024).toFixed(0)} KB)`;
                    previewDiv.style.color = "var(--emerald-light)";
                }
            } else {
                previewDiv.innerText = "Belum ada berkas";
                previewDiv.style.color = "var(--gray-muted)";
            }
            calculateProgress();
        });
    });

    // Kontrol Operasional Aksi Tombol
    document.getElementById("btnReset").addEventListener("click", resetFormDenganKonfirmasi);
    document.getElementById("btnPreview").addEventListener("click", bukaPreviewModal);
    document.getElementById("closePreview").addEventListener("click", () => previewModal.classList.remove("active"));
    document.getElementById("btnEditKembali").addEventListener("click", () => previewModal.classList.remove("active"));
    document.getElementById("btnCancelSubmit").addEventListener("click", () => confirmModal.classList.remove("active"));
    document.getElementById("btnFinalSubmit").addEventListener("click", eksekusiSubmitAkhir);

    // Proses Submit Ter-Intersepsi Validasi
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validateAllFields()) {
            confirmModal.classList.add("active");
        } else {
            showToast("⚠️ Ada field wajib yang kosong atau tidak valid!");
            const firstErrorElement = document.querySelector(".has-error");
            if (firstErrorElement) firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    // Skema Saklar Tema (Dark/Light Mode)
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const targetTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", targetTheme);
        localStorage.setItem("ppdb-theme", targetTheme);
        themeToggle.innerHTML = targetTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Monitor Jendela Gulir (Scroll) Back To Top
    window.addEventListener("scroll", () => {
        if (window.scrollY > 350) {
            backToTopBtn.classList.add("active");
        } else {
            backToTopBtn.classList.remove("active");
        }
    });
    backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));


    // ==========================================================================
    // LOGIC ARCHITECTURE FUNCTIONS
    // ==========================================================================

    // --- SEARCHABLE SELECT ENGINE PROVINSI ---
    function setupSearchableDropdown() {
        daftarProvinsi.forEach(provinsi => {
            const optionDiv = document.createElement("div");
            optionDiv.classList.add("search-option-item");
            optionDiv.innerText = provinsi;
            optionDiv.addEventListener("click", () => {
                provSearch.value = provinsi;
                provHidden.value = provinsi;
                provOptions.classList.remove("active");
                validateField(provSearch);
                saveToLocalStorage();
                calculateProgress();
            });
            provOptions.appendChild(optionDiv);
        });

        provSearch.addEventListener("focus", () => provOptions.classList.add("active"));
        
        provSearch.addEventListener("input", (e) => {
            const searchVal = e.target.value.toLowerCase();
            const optionItems = provOptions.querySelectorAll(".search-option-item");
            optionItems.forEach(item => {
                if (item.innerText.toLowerCase().includes(searchVal)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".dropdown-searchable")) {
                provOptions.classList.remove("active");
            }
        });
    }

    // --- COUNTER KARAKTER ALAMAT ---
    function setupCharCounter() {
        alamatTextarea.addEventListener("input", () => {
            alamatCounter.innerText = alamatTextarea.value.length;
        });
    }

    // --- AUTO CAPITALIZE HURUF AWAL ---
    function setupAutoCapitalize() {
        document.querySelectorAll(".auto-capitalize").forEach(input => {
            input.addEventListener("keyup", (e) => {
                let kataArr = e.target.value.split(' ');
                for (let i = 0; i < kataArr.length; i++) {
                    kataArr[i] = kataArr[i].charAt(0).toUpperCase() + kataArr[i].slice(1);
                }
                e.target.value = kataArr.join(' ');
            });
        });
    }

    // --- ENGINE VALIDASI REALTIME ---
    function validateField(element) {
        if (!element.hasAttribute('required') && element.value.trim() === "") {
            const parentGroup = element.closest(".form-group") || element.closest(".upload-row");
            if (parentGroup) clearError(parentGroup);
            return true;
        }

        const parentGroup = element.closest(".form-group") || element.closest(".upload-row");
        let isValid = true;
        let errorMessage = "Data wajib diisi";

        if (element.hasAttribute('required') && (!element.value || element.value.trim() === "")) {
            isValid = false;
        } else {
            // Aturan Bisnis Validasi Spesifik Administrasi PPDB
            if (["nikSiswa", "kkSiswa", "nikAyah", "nikIbu"].includes(element.id)) {
                if (!/^\d{16}$/.test(element.value)) {
                    isValid = false;
                    errorMessage = "Harus berupa angka dan tepat 16 digit";
                }
            }
            else if (["hpAyah", "hpIbu", "hpDarurat"].includes(element.id) || element.type === "tel") {
                if (!/^\d+$/.test(element.value)) {
                    isValid = false;
                    errorMessage = "Hanya diperbolehkan berisi karakter angka";
                }
            }
            else if (element.type === "email") {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(element.value)) {
                    isValid = false;
                    errorMessage = "Format penulisan email salah (ex: nama@email.com)";
                }
            }
            else if (element.type === "date") {
                const targetDate = new Date(element.value);
                const currentSystemDate = new Date();
                if (targetDate > currentSystemDate) {
                    isValid = false;
                    errorMessage = "Tanggal lahir tidak valid melampaui hari ini";
                }
            }
            else if (element.id === "provSearch" && !provHidden.value) {
                isValid = false;
                errorMessage = "Silakan klik dan pilih provinsi dari list opsi";
            }
        }

        if (!isValid && parentGroup) {
            showFieldError(parentGroup, errorMessage);
        } else if (parentGroup) {
            clearError(parentGroup);
        }

        return isValid;
    }

    function showFieldError(parent, msg) {
        parent.classList.add("has-error");
        let errorDiv = parent.querySelector(".error-message");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.classList.add("error-message");
            parent.appendChild(errorDiv);
        }
        errorDiv.innerText = msg;
    }

    function clearError(parent) {
        parent.classList.remove("has-error");
        const errorDiv = parent.querySelector(".error-message");
        if (errorDiv) errorDiv.remove();
    }

    function validateAllFields() {
        let status = true;
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (!validateField(input)) status = false;
        });
        return status;
    }

    // --- PERHITUNGAN DINAMIS PROGRESS BAR ---
    function calculateProgress() {
        const requiredElements = form.querySelectorAll("input[required], select[required], textarea[required]");
        let hitungIsi = 0;

        requiredElements.forEach(item => {
            if (item.type === "file") {
                if (item.files.length > 0) hitungIsi++;
            } else if (item.value && item.value.trim() !== "") {
                hitungIsi++;
            }
        });

        const hasilPersen = requiredElements.length > 0 ? Math.round((hitungIsi / requiredElements.length) * 100) : 0;
        document.getElementById("formProgressBar").style.width = `${hasilPersen}%`;
        document.getElementById("formProgressText").innerText = `Pengisian: ${hasilPersen}%`;
    }

    // --- MANAGEMENT LOCALSTORAGE AUTOSAVE ---
    function saveToLocalStorage() {
        const objekData = {};
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.type !== "file" && input.type !== "checkbox" && input.id) {
                objekData[input.id] = input.value;
            }
        });
        localStorage.setItem("ppdb-autosave-data", JSON.stringify(objekData));
    }

    function loadFromLocalStorage() {
        const stringData = localStorage.getItem("ppdb-autosave-data");
        if (stringData) {
            const parsingObjek = JSON.parse(stringData);
            Object.keys(parsingObjek).forEach(idKunci => {
                const elemenTarget = document.getElementById(idKunci);
                if (elemenTarget && elemenTarget.type !== "file") {
                    elemenTarget.value = parsingObjek[idKunci];
                }
            });
            if (provHidden.value) provSearch.value = provHidden.value;
            if (alamatTextarea.value) alamatCounter.innerText = alamatTextarea.value.length;
        }
    }

    // --- RESET FORM ---
    function resetFormDenganKonfirmasi() {
        if (confirm("⚠️ Apakah Anda yakin ingin mematikan sistem dan mengosongkan seluruh isi form?")) {
            form.reset();
            localStorage.removeItem("ppdb-autosave-data");
            document.querySelectorAll(".file-preview").forEach(p => p.innerText = "Belum ada berkas");
            alamatCounter.innerText = "0";
            form.querySelectorAll(".form-group, .upload-row").forEach(g => g.classList.remove("has-error"));
            document.querySelectorAll(".error-message").forEach(e => e.remove());
            calculateProgress();
            window.scrollTo({ top: 0, behavior: "smooth" });
            showToast("🔄 Seluruh isian form berhasil dibersihkan.");
        }
    }

    // --- SYSTEM PREVIEW MODAL ---
    function bukaPreviewModal() {
        let tabelHtml = '<table class="preview-table"><thead><tr><th>Kategori Data</th><th>Nilai Isian</th></tr></thead><tbody>';
        
        form.querySelectorAll("input, select, textarea").forEach(input => {
            if (input.id && input.id !== "provSearch" && input.type !== "file") {
                const elemenLabel = document.querySelector(`label[for="${input.id}"]`) || document.querySelector(`label[for="${input.name}"]`);
                const teksLabel = elemenLabel ? elemenLabel.innerText.replace('*','').trim() : input.id;
                const teksValue = input.value ? input.value : "-";
                tabelHtml += `<tr><td><strong>${teksLabel}</strong></td><td>${teksValue}</td></tr>`;
            }
        });

        form.querySelectorAll("input[type='file']").forEach(fileField => {
            const labelText = fileField.closest('.upload-row')?.querySelector('.upload-label')?.innerText.replace('*','').trim() || 'Berkas';
            const namaFile = fileField.files.length > 0 ? fileField.files[0].name : "Belum terunggah";
            tabelHtml += `<tr><td><strong>${labelText}</strong></td><td><i class="fas fa-file-alt"></i> ${namaFile}</td></tr>`;
        });

        tabelHtml += '</tbody></table>';
        previewContainer.innerHTML = tabelHtml;
        previewModal.classList.add("active");
    }

    // --- SUBMIT AKHIR SIMULASI AJAX ---
    function eksekusiSubmitAkhir() {
        confirmModal.classList.remove("active");
        previewModal.classList.remove("active");
        loadingOverlay.classList.add("active");

        setTimeout(() => {
            loadingOverlay.classList.remove("active");
            showToast("🎉 Sukses! Data PPDB Anda berhasil diamankan ke server.");
            form.reset();
            localStorage.removeItem("ppdb-autosave-data");
            document.querySelectorAll(".file-preview").forEach(p => p.innerText = "Belum ada berkas");
            alamatCounter.innerText = "0";
            calculateProgress();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000); 
    }

    // --- UTILITIES (Toast, Theme, Ripple, Scroll Reveal) ---
    function showToast(pesanTeks) {
        const toastBox = document.createElement("div");
        toastBox.classList.add("toast");
        toastBox.innerHTML = `<i class="fas fa-info-circle"></i> <span class="toast-text">${pesanTeks}</span>`;
        toastContainer.appendChild(toastBox);
        
        setTimeout(() => {
            toastBox.style.animation = "slideUp 0.25s ease reverse forwards";
            setTimeout(() => toastBox.remove(), 250);
        }, 4000);
    }

    function initTheme() {
        const temaTersimpan = localStorage.getItem("ppdb-theme") || "light";
        document.documentElement.setAttribute("data-theme", temaTersimpan);
        themeToggle.innerHTML = temaTersimpan === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function setupScrollReveal() {
        const elemenReveal = document.querySelectorAll(".scroll-reveal");
        const observerSistem = new IntersectionObserver((daftarEntri) => {
            daftarEntri.forEach(entri => {
                if (entri.isIntersecting) {
                    entri.target.classList.add("revealed");
                }
            });
        }, { threshold: 0.03 });

        elemenReveal.forEach(targetEl => observerSistem.observe(targetEl));
    }

    function setupRippleEffect() {
        document.querySelectorAll(".ripple").forEach(tombol => {
            tombol.addEventListener("click", function (e) {
                const areaTombol = this.getBoundingClientRect();
                const koordinatX = e.clientX - areaTombol.left;
                const koordinatY = e.clientY - areaTombol.top;
                
                const gelombangRipple = document.createElement("span");
                gelombangRipple.classList.add("ripple-wave");
                gelombangRipple.style.left = `${koordinatX}px`;
                gelombangRipple.style.top = `${koordinatY}px`;
                
                this.appendChild(gelombangRipple);
                setTimeout(() => gelombangRipple.remove(), 550);
            });
        });
    }
});
