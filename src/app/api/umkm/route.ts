import { NextResponse } from "next/server";
import { hubungkanDatabase } from "@/lib/db";
import Umkm from "@/models/umkm";
import { pseudoRandomBytes } from "crypto";

export async function GET() {
    try {
        await hubungkanDatabase(); // Pastikan koneksi database terhubung

        // Minta Mongoose mencari semua data di cetakan Umkm
        // .sort({ createAt: -1 }) artinya urutkan dari data yang paling baru ditambahkan
        const semuaUmkm = await Umkm.find({}).sort({ createdAt: -1 });
        return NextResponse.json(semuaUmkm, { status: 200 });
    } catch (error) {
        console.error("Error GET UMKM:", error);
        return NextResponse.json({ pesan: "Gagal mengambil data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        //Ambil data mentah yang dikirim oleh front-end
        const dataBaru = await request.json();

        await hubungkanDatabase(); // Pastikan koneksi database terhubung

        // Minta Mongoose mencari semua data di cetakan Umkm
        const umkmTersimpan = await Umkm.create(dataBaru);
        // Beritahu front-end bahwa penyimpanan berhasil
        return NextResponse.json(umkmTersimpan, { status: 200 });
    } catch (error) {
        console.error("Error POST UMKM:", error);
        return NextResponse.json({ pesan: "Gagal mengambil data" }, { status: 500 });
    }
}