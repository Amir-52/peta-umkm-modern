import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang diunggah.'}, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'PetaUMKM',
        });

        return NextResponse.json({ url: result.secure_url }, { status: 200 });
    }  catch (error) {
        console.error('Error saat upload gambar:', error);
        return NextResponse.json({ error: 'Gagal mengunggah gamabr ke server.'}, { status: 500 });
    }
}