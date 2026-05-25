// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; // Pastikan useEffect diimport
import dynamic from 'next/dynamic';

const PetaInteraktif = dynamic(() => import('@/components/Map'), 
  { 
    ssr: false,
    loading: () => (
      <div className="text-center">
        <p className="text-slate-500 animate-pulse">Sedang memuat sistem peta...</p>
      </div>
    ),
  });

// Sesuaikan interface dengan format data asli MongoDB (_id)
interface UMKM {
  _id: string; // Menggunakan string _id dari MongoDB
  nama: string;
  kategori: string;
  alamat: string;
  koordinat: [number, number];
}

export default function PetaUMKMPage() {
  const [dataUMKM, setDataUMKM] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [kategoriAktif, setKategoriAktif] = useState<string>("Semua Kategori");
  const [koordinatZoom, setKoordinatZoom] = useState<[number, number] | null>(null);
  const [kataKunci, setKataKunci] = useState<string>(""); // kotak pencarian
  const [tampilForm, setTampilForm] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [formInput, setFormInput] = useState({
    nama: "",
    kategori: "Kuliner",
    alamat: "",
    lat:"",
    lng: ""
  });

  const ambilDataDatabase = async () => {
    try {
      setLoading(true);
      const respons = await fetch('/api/umkm');
      const data = await respons.json();
      setDataUMKM(data);
    } catch (error) {
      console.log("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Menambahkan useEffect agar fungsi di atas otomatis berjalan ---
  useEffect(() => {
    ambilDataDatabase();
  }, []);

  const tanganiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const dataKirim = {
        nama: formInput.nama,
        kategori: formInput.kategori,
        alamat: formInput.alamat,
        koordinat: [parseFloat(formInput.lat), parseFloat(formInput.lng)]
      };

      const respons = await fetch('/api/umkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(dataKirim),
      });

      if (respons.ok) {
        const dataBaru = await respons.json();
        setDataUMKM([dataBaru, ...dataUMKM]);
        setTampilForm(false);
        setFormInput({ nama: "", kategori: "Kuliner", alamat: "", lat: "", lng: "" });
      } else {
        alert("❗ Gagal menyimpan data ke database!");
      }
    } catch (error) {
      console.log("Terjadi kesalahan:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const dataDifilter = dataUMKM.filter((umkm) => {
    // Cek kecocokan kategori
    const cocokKategori = kategoriAktif === "Semua Kategori" || umkm.kategori === kategoriAktif;
    // Cek kecocokan teks nama (diubah ke huruf kecil semua supaya tidak sensitif huruf kapital)
    const cocokNama = umkm.nama.toLocaleLowerCase().includes(kataKunci.toLocaleLowerCase());
    // Data lolos jika memenihi dua syarat diatas
    return cocokKategori && cocokNama;
  });

  const daftarKategori = ["Semua Kategori", "Kuliner", "Fashion", "Kerajinan", "Jasa"];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-blue-700 text-white p-4 shadow-lg z-10">
          <h1 className="text-xl font-bold">📍 Peta UMKM Bogor Modern</h1>
        </nav>

        {/* Konten Utama */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Kolom Kiri: Daftar UMKM */}
          <section className="w-1/3 bg-white border-r overflow-y-auto p-4 flex flex-col">

            {/* Tombol Toggle Form */}
            <button onClick={() => setTampilForm(!tampilForm)} className="w-full mb-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-md">
              {tampilForm ? "Kembali ke Daftar UMKM" : "➕ Tambah UMKM Baru"}
            </button>

            {/* --- Memasukkan seluruh elemen daftar ke dalam blok pengkondisian --- */}
            {tampilForm ? (
              // --- Tampilan Formulir ---
              <form onSubmit={tanganiSubmit} className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                <h2 className="font-bold text-lg text-gray-700 border-b pb-2">Data UMKM Baru</h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nama UMKM</label>
                  <input required type="text" className="w-full p-2 border rounded bg-white text-black" value={formInput.nama} onChange={(e) => setFormInput({...formInput, nama: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                  <select className="w-full p-2 border rounded bg-white text-black" value={formInput.kategori} onChange={(e) => setFormInput({...formInput, kategori: e.target.value})}>
                    <option value="Kuliner">Kuliner</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Jasa">Jasa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat Lengkap</label>
                  <textarea required className="w-full p-2 border rounded bg-white text-black" rows={2} value={formInput.alamat} onChange={(e) => setFormInput({...formInput, alamat: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude</label>
                    <input required type="number" step="any" className="w-full p-2 border rounded text-sm bg-white text-black" placeholder="-6.595" value={formInput.lat} onChange={(e) => setFormInput({...formInput, lat: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude</label>
                    <input required type="number" step="any" className="w-full p-2 border rounded text-sm bg-white text-black" placeholder="106.789" value={formInput.lng} onChange={(e) => setFormInput({...formInput, lng: e.target.value})} />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loadingSubmit}
                  className={`w-full py-2 text-white font-bold rounded-lg transition-colors ${loadingSubmit ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loadingSubmit ? "Menyimpan..." : "Simpan ke Database"}
                </button>
              </form>
            ) : (
              // --- Tampilan Daftar UMKM & Filter Kategori ---
              <>
                {/* Kotak Pencarian Baru */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cari Nama UMKM</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="🔍 Ketik Nama Tempat... (misal: Soto)"
                      className="w-full p-2.5 pl-9 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-500 focus:outline-none transitions-all text-black shadow-sm"
                      value={kataKunci}
                      onChange={(e) => setKataKunci(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Filter Kategori */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Filter Kategori</h2>
                  <div className="flex flex-wrap gap-2">
                    {daftarKategori.map((kat) => (
                      <button 
                        key={kat} 
                        onClick={() => setKategoriAktif(kat)} 
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${kategoriAktif === kat ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {kat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <h2 className="text-lg font-bold text-gray-700 mb-3">UMKM Terdaftar ({dataDifilter.length})</h2>

                {/* Bagian Daftar Kartu */}
                <div className="space-y-3 flex-1">
                  {loading ? (
                    <p className="text-gray-400 italic text-sm text-center mt-10 animate-pulse">Mengambil data dari MongoDB...</p>
                  ) : dataDifilter.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">Tidak ada UMKM di kategori ini.</p>
                  ) : (
                    dataDifilter.map((umkm) => (
                      <div 
                        key={umkm._id} // PERBAIKAN 2: Mengubah umkm.id menjadi umkm._id
                        onClick={() => setKoordinatZoom(umkm.koordinat)}
                        className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all border-gray-200 shadow-sm"
                      >
                        <h3 className="font-bold text-blue-800">{umkm.nama}</h3>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded mt-1 uppercase">{umkm.kategori}</span>
                        <p className="text-sm text-gray-600 mt-2">{umkm.alamat}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>

          {/* Kolom Kanan: Area Peta */}
          <section className="w-2/3 bg-blue-50 relative z-0">
            <PetaInteraktif data={dataDifilter} koordinatZoom={koordinatZoom} />
          </section>

        </div>
      </main>
      {/* Footer */}
      <footer className="p-4 text-center text-gray-400 text-xs border-t bg-white">
        © 2026 Proyek Peta UMKM Bogor - Dibangun dengan Next.js & TypeScript
      </footer>
    </div>
  )
}