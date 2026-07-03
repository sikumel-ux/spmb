// admin.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. ROUTE GUARD (PROTECTION) ---
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html"; // Tendang keluar jika belum login
    } else {
        document.getElementById("adminUserEmail").innerText = user.email;
        loadDashboardData();
    }
});

// --- 2. LOGOUT LOGIC ---
document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
});

// --- 3. FETCH & CALCULATE ENGINE ---
async function loadDashboardData() {
    const tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "<tr><td colspan='8'>Memuat data...</td></tr>";

    try {
        const q = query(collection(db, "pendaftaran"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        let counter = 1;
        let htmlContent = "";
        let totalCount = 0;
        let hariIniCount = 0;
        
        const hariIniStr = new Date().toDateString();

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            totalCount++;
            
            // Perhitungan Filter Waktu
            if(data.createdAt) {
                const docDate = data.createdAt.toDate();
                if(docDate.toDateString() === hariIniStr) hariIniCount++;
            }

            htmlContent += `
                <tr>
                    <td>${counter++}</td>
                    <td><strong>${data.nomorPendaftaran || 'SPMB-2026-XXXX'}</strong></td>
                    <td>${data.anak?.namaLengkap || '-'}</td>
                    <td>${data.anak?.nik || '-'}</td>
                    <td>${data.ayah?.nama || '-'}</td>
                    <td>${data.ibu?.nama || '-'}</td>
                    <td><span class="badge pending">${data.status || 'Pending'}</span></td>
                    <td>
                        <button class="btn-action" style="background:#3b82f6; color:#fff;" onclick="alert('Detail ID: ${docSnap.id}')">Lihat</button>
                        <button class="btn-action" style="background:#ef4444; color:#fff;">Hapus</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = htmlContent || "<tr><td colspan='8'>Belum ada siswa pendaftar.</td></tr>";
        
        // Update Metrik Atas Dasbor
        document.getElementById("statTotal").innerText = totalCount;
        document.getElementById("statHariIni").innerText = hariIniCount;
        document.getElementById("statMingguIni").innerText = totalCount; // Fallback agregat terdekat

    } catch (error) {
        console.error("Error loading dashboard data: ", error);
        tbody.innerHTML = "<tr><td colspan='8' style='color:red;'>Gagal memuat data dari database.</td></tr>";
    }
}

// --- 4. REALTIME TABLE FILTER/SEARCH ---
document.getElementById("tableSearch").addEventListener("keyup", (e) => {
    const keyword = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#studentTableBody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(keyword) ? "" : "none";
    });
});
