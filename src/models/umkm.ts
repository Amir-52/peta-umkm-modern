import mongoose, { Schema, Document } from "mongoose";

export interface IUmkm extends Document {
    nama: string;
    kategori: string;
    alamat: string;
    koordinat: [number, number];
}

const umkmSchema = new Schema({
    nama: { type: String, require: true },
    kategori: { type: String, require: true },
    alamat: { type: String, require: true },
    koordinat: { 
        type: [Number], // array yang berisi angka [Latitude, Longitude]
        require: true 
    }
}, {
    timestamps: true // waktu otomatis dibuat (createAt)
});

const Umkm = mongoose.models.Umkm || mongoose.model<IUmkm>('Umkm', umkmSchema);

export default Umkm;