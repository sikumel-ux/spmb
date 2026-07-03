// admin.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allData = [];

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        document.getElementById("adminUserEmail").innerText = user.email;
        fetchData();
    }
});

document.getElementById("btnLogout").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "login.html");
});

async function fetchData() {
    const tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "<tr><td colspan='8'>Sinkronisasi Cloud...</td></tr>";
    
    try {
        const q = query(collection(db, "pendaftaran"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        allData = [];
        
        snap.forEach(doc => {
            allData.push({ id: doc.id, ...doc.data() });
        });
        
        renderTable(allData);
        calculateMetrics(allData);
    } catch (err) {
        tbody.innerHTML = "<tr><td colspan='8' style='color:red;'>Gagal sinkronisasi data database.</td></tr>";
    }
}

function renderTable(data) {
    const tbody = document.getElementById("studentTableBody");
    if(data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='8'>Tidak ada data ditemukan.</td></tr>";
        return;
    }
    
    let counter = 1;
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${counter++}</td>
            <td><strong>${item.nomorPendaftaran || '-'}</strong></td>
            <td>${item.anak?.namaLengkap || '-'}</td>
            <td>${item.anak?.nik || '-'}</td>
            <td>${item.ayah?.nama || '-'}</td>
            <td>${item.ibu?.nama || '-'}</td>
            <td><span class="badge pending">${item.status || 'Pending'}</span></td>
            <td style="text-align:center;">
                <button class="btn-view" data-id="${item.id}">Lihat</button>
            </td>
        </tr>
    `).join('');

    // Bind Event Detail Button
    document.querySelectorAll(".btn-view").forEach(btn => {
        btn.addEventListener("click", (e) => showDetail(e.target.dataset.id));
    });
}

function calculateMetrics(data) {
    document.getElementById("statTotal").innerText = data.length;
    const todayStr = new Date().toDateString();
    const hariIni = data.filter(item => item.createdAt && item.createdAt.toDate().toDateString() === todayStr).length;
    document.getElementById("statHariIni").innerText = hariIni;
    document.getElementById("statMingguIni").innerText = data.length; 
}

function showDetail(id) {
    const record = allData.find(item => item.id === id);
    if(!record) return;

    const body = document.getElementById("detailModalBody");
    body.innerHTML = `
        <h4 style="color:#4CAF50; margin-bottom:10px;">I. Berkas Anak</h4>
        <b>Nama Lengkap:</b> ${record.anak?.namaLengkap || '-'}<br>
        <b>NIK:</b> ${record.anak?.nik || '-'}<br>
        <b>No KK:</b> ${record.anak?.noKk || '-'}<br>
        <b>Alamat:</b> ${record.anak?.alamat || '-'}<br><br>
        <h4 style="color:#4CAF50; margin-bottom:10px;">II. Berkas Ayah</h4>
        <b>Nama:</b> ${record.ayah?.nama || '-'}<br>
        <b>WhatsApp:</b> ${record.ayah?.hp || '-'}<br><br>
        <h4 style="color:#4CAF50; margin-bottom:10px;">III. Berkas Ibu</h4>
        <b>Nama:</b> ${record.ibu?.nama || '-'}<br>
        <b>WhatsApp:</b> ${record.ibu?.hp || '-'}
    `;
    document.getElementById("detailModal").style.display = "flex";
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("detailModal").style.display = "none";
});

document.getElementById("tableSearch").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allData.filter(item => 
        (item.anak?.namaLengkap || '').toLowerCase().includes(val) || 
        (item.anak?.nik || '').includes(val)
    );
    renderTable(filtered);
});

// Mobile Drawer Trigger
const mobileToggle = document.getElementById("menuMobileToggle");
const sidebar = document.getElementById("adminSidebar");
if(mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        mobileToggle.innerText = sidebar.classList.contains("active") ? "✕" : "☰";
    });
}
