import { NextResponse } from "next/server";
import { hubungkanDatabase } from "@/lib/db";
import Umkm from "@/models/umkm";
import { ObjectId } from "mongodb";

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


export async function PUT(request: Request) {
  try {
    
    const data = await request.json();
    
    const { _id, ...dataYangDiupdate } = data;

    if (!_id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    }

    await hubungkanDatabase();
    
    const result = await Umkm.updateOne(
      { _id: new ObjectId(_id) },
      { $set: dataYangDiupdate }
    );

    return NextResponse.json({ message: 'Data berhasil diperbarui' }, { status: 200 });
  } catch (error) {
    console.error("Error saat update:", error);
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

 export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID tidak ditemukan.' }, { status: 400 });
        }

        await hubungkanDatabase();

        const result = await Umkm.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            return NextResponse.json({ message: 'Data berhasil dihapus.' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 });
        }
       
    } catch (error) {
        console.error("Error DELETE UMKM:", error);
        return NextResponse.json({ pesan: "Gagal menghapus data" }, { status: 500 });
    }
}