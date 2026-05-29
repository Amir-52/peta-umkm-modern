// src/components/Map.ts
"use client"; // menandai komponen ini sebagai client component

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// --- PEMBARUAN: Menggunakan Aset Lokal Folder Public (Bebas Blokir Browser) ---
const getIkonKustom = (kategori: string) => {
    // Menggunakan CDN jsDelivr global yang stabil untuk ikon penanda
    let urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-blue.png"; 

    if (kategori === "Kuliner") {
        urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png";
    } else if (kategori === "Fashion") {
        urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png";
    } else if (kategori === "Kerajinan") {
        urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-orange.png";
    } else if (kategori === "Jasa") {
        urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-violet.png";
    } else if (kategori === "User") {
        urlWarnaIkon = "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-gold.png";
    }

    return new L.Icon({
        iconUrl: urlWarnaIkon,
        // PERBAIKAN: Menyambung kembali URL shadow agar menjadi satu baris utuh
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

// Struktur data sama dengan yang ada di page.tsx
interface UMKM {
    _id: string;
    nama: string;
    kategori: string;
    alamat: string;
    koordinat: [number, number];
}

interface MapProps {
    data: UMKM[];
    koordinatZoom: [number, number] | null; // Menerima koordinat dari luar
    // --- Saluran untuk mengirim lokasi user ke halaman utama ---
    onKirimLokasiKeHomePage: (koordinat: [number, number] | null) => void;
}

// Koomponen Logika untuk menggambar garis rute
function KomponenRute({ dari, ke }: { dari: [number,number] | null; ke: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !dari || !ke) return;

        // Membuat kontrol rute jalan
        const kontrolRute = (L as any).Routing.control({
            waypoints: [
                L.latLng(dari[0], dari[1]), // Titik awal (User)
                L.latLng(ke[0], ke[1]) // Titik Tujuan (UMKM)
            ], 
            lineOptions: {
                styles: [{ color: "#2563eb", weight: 5, opacity: 0.8 }], // Garis warna biru khas navigasi
            },
            createMarker: () => null, // Sembunyikan marker bawaan routing biar tidak tumpang tindih
            addWaypoints: false, // Kunci rute agar tidak bisa digesr-geser manual oleh user
            routeWhileDragging: false,
            show: false,
            itinerary: false,
            containerClassName: "hidden" // Memaksa kontainer teks tidak muncul
        }).addTo(map);

        // Hapus garis rute lama jika user mengklik toko UMKM lain
        return () => {
            if (map && kontrolRute) {
                map.removeControl(kontrolRute);
            }
        };
    }, [map, dari, ke]);

    return null;
}

// Komponen bantuan untuk menggeser peta secara mulus
function MovePeta({ koordinat }: { koordinat: [number, number] | null}) {
    const map = useMap();

    useEffect(() => {
        if (koordinat) {
            // Menggeser peta ke koordinat baru dengan efek animasi dan zoom level 16 
            map.flyTo(koordinat, 16, { animate: true, duration: 1.5 });
        }
    }, [koordinat, map]);

    return null;
}

// Komponen tombol untuk mendapatkan lokasi pengguna
function TombolLokasiUser({ onLokasiDitemukan }: { onLokasiDitemukan: (koordinat: [number, number]) => void }) {
    const map = useMap();
    const [loadingGps, setLoadingGps] = useState(false);

    const dapatkanLokasiGps = () => {
        if (!navigator.geolocation) {
            alert("Maaf, browser Anda tidak mendukung pelacakan lokasi GPS.");
            return;
        }

        setLoadingGps(true);
        navigator.geolocation.getCurrentPosition(
            (posisi) => {
                const { latitude, longitude } = posisi.coords;
                const koordinatUser: [number, number] = [latitude, longitude];
                // Kirim koordinat ke state utama komponen Map
                onLokasiDitemukan(koordinatUser);
                // Terbangkan kamera peta ke lokasi user
                map.flyTo(koordinatUser, 16, { animate: true, duration: 1.5});
                setLoadingGps(false);
            },
            (error) => {
                console.error("Gagal mendapatkan loasi:", error);
                alert("Gagal mendeteksi lokasi. Pastikan izin GPS di browser sudah diaktifkan.");
                setLoadingGps(false);
            }, 
            { enableHighAccuracy: true } // Memaksa akurasi tinngi (GPS HP/WIFI)
        );
    };

    return (
        <div className="absolute bottom-5 right-5 z-[1000]">
            <button
                onClick={dapatkanLokasiGps}
                disabled={loadingGps}
                type="button"
                className="bg-white hover:bg-gray-100 text-gray-800 font-bold p-3 rounded-full shadow-lg border border-gray-300 flex items-center justify-center transition-all group"
                title="Cari Lokasi Saya">
                    {loadingGps ? (
                        <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-fill"></span>
                    ) : (
                        <span className="text-xl group-hover:scale-110 transistion-transform">🎯</span>
                    )}
                </button>
        </div>
    );
}

export default function Map({ data, koordinatZoom, onKirimLokasiKeHomePage }: MapProps) {
    // Koordinat Pusat Peta (Bogor)
    const posisiPusat: [number, number] = [-6.595038, 106.789116];

    // State untuk mneyimpan tiitk lokasi user 
    const [lokasiUser, setLokasiUser] = useState<[number,number] | null>(null);

    // Setiap kali lokasiUser berubah, kirim datanya ke file page.tsx utama
    useEffect(() => {
        onKirimLokasiKeHomePage(lokasiUser);
    }, [lokasiUser, onKirimLokasiKeHomePage]);

    return (
        <div className="relative h-full w-full">
            {/* Menggunakan LayerControl untuk menyalakan/mematikan Live Traffic */}
            <MapContainer center={posisiPusat} zoom={13} className="h-full w-full">
               <LayersControl position="topright"> {/* Lapisan Utama: Peta Jalan Standar */}
                    <LayersControl.BaseLayer checked name="Peta Standar">
                      <TileLayer attribution='&copy;
                    <a href="https://openstreetmap.org/copyright">OpenStreetmap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />   
                    </LayersControl.BaseLayer>

                    {/* Lapisan Live Traffic Line */}
                    <LayersControl.Overlay checked name="🚦 Pantauan Lalu Lintas">
                        <TileLayer
                            attribution='&copy; <a href="https://maps.google.com">Google Maps Traffic</a>'
                            // Menghubungkan langsung ke server visual lalu lintas real-time milik Google
                            url="https://mt1.google.com/vt/lyrs=m@221000000,traffic&x={x}&y={y}&z={z}"
                            opacity={0.8}
                        />
                    </LayersControl.Overlay>
                </LayersControl>
                
                {/* Memasang komponen penggeser peta */}
                <MovePeta koordinat={koordinatZoom} />

                {/* Garis Rute */}
                <KomponenRute dari={lokasiUser} ke={koordinatZoom} />

                {/* Tombol GPS User */}
                <TombolLokasiUser onLokasiDitemukan={(koordinat) => setLokasiUser(koordinat)} />

                {/* Pin Lokasi User */}
                {lokasiUser && (
                    <Marker position={lokasiUser} icon={getIkonKustom("User")}>
                        <Popup>
                            <div className="text-center p-1">
                                <p className="font-bold text-sm text-amber-600 m-0"> 📍 Posisi Anda Sekarang</p>
                                <p className="text-[11px] text-gray-500 m-0.5">Mendeteksi koordinat perangkat Anda secara real-time.</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Looping untuk menampilkan pin (marker) UMKM di peta */}
                {data.map((umkm) => (
                    <Marker key={umkm._id} position={umkm.koordinat} icon={getIkonKustom(umkm.kategori)}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm text-blue-800">{umkm.nama}</h3>
                                <p className="text-xs text-gray-500 m-0 font-semibold">{umkm.kategori}</p>
                                <p className="text-xs text-gray-600 mt-1 m-0">{umkm.alamat}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>  
        </div>
    );
}