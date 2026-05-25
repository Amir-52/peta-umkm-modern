// src/components/Map.ts
"use client"; // menandai komponen ini sebagai client component

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

/* Perbaiki bug ikon Leaflet yang sering hilang di Next.js
 const ikonKustom = new L.Icon({
     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
     iconSize: [25, 41],
     iconAnchor: [12, 41],
 }); */

// --- Pembuat Ikon Berdasarkan Kategori ---
const getIkonKustom = (kategori: string) => {
    let urlWarnaIkon = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"; // default biru

    // Tentukan warna berdasarkan kategori UMKM
    if (kategori === "Kuliner") {
        urlWarnaIkon = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"; // Kuliner = Merah
    } else if (kategori === "Fashion") {
        urlWarnaIkon = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"; // Fashion = Hijau
    } else if (kategori === "Kerajinan") {
        urlWarnaIkon = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"; // Kerajinan = Oranye
    } else if (kategori === "Jasa") {
        urlWarnaIkon = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"; // Jasa = Ungu
    }

    return new L.Icon({
        iconUrl: urlWarnaIkon,
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], // Ukuran pin fisik [lebar, tinggi]
        iconAnchor: [12, 41], // titik tumpu ujung bawah pin pada koordinat asli peta
        popupAnchor: [1, -34], // posisi balon teks pop-up relatif terhadap ujung pin 
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


export default function Map({ data, koordinatZoom }: MapProps) {
    // Koordinat Pusat Peta (Bogor)
    const posisiPusat: [number, number] = [-6.595038, 106.789116];

    return (
        <MapContainer center={posisiPusat} zoom={13} className="h-full w-full">
            {/* Gambar peta menggunakan OpenStreetMap gratis */}
            <TileLayer attribution='&copy;
                <a href="https://openstreetmap.org/copyright">OpenStreetmap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Memasang komponen penggeser peta */}
            <MovePeta koordinat={koordinatZoom} />
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
    );
}