import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return NextResponse.json(
                { error: "No file received." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const fileExt = path.extname(file.name);
        const fileName = `${Date.now()}${fileExt}`;
        
        // Save file to public directory
        const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
        await writeFile(filePath, buffer);
        
        return NextResponse.json({ 
            success: true,
            fileName: fileName,
            url: `/uploads/${fileName}`
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
        );
    }
}
