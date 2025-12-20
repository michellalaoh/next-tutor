import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData(); //in express req.body

        let event;

        try {
            event = Object.fromEntries(formData.entries());

            // Parse JSON strings for array fields (agenda and tags)
            if (typeof event.agenda === 'string') {
                try {
                    event.agenda = JSON.parse(event.agenda);
                } catch (e) {
                    return NextResponse.json({ message: 'Invalid agenda format. Expected JSON array.' }, { status: 400 });
                }
            }

            if (typeof event.tags === 'string') {
                try {
                    event.tags = JSON.parse(event.tags);
                } catch (e) {
                    return NextResponse.json({ message: 'Invalid tags format. Expected JSON array.' }, { status: 400 });
                }
            }

            // Normalize mode to lowercase (required by schema enum)
            if (event.mode && typeof event.mode === 'string') {
                event.mode = event.mode.toLowerCase();
            }
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format' }, { status: 400 })
        }

        const file = formData.get('image') as File;

        if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 })

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, result) => {
                if (error) return reject(error);

                resolve(result)
            }).end(buffer)
        });

        event.image = (uploadResult as { secure_url: string }).secure_url

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda
        });

        return NextResponse.json({ message: "Event created successfully", event: createdEvent }, { status: 201 })
    } catch (e) {
        console.error('Event creation error:', e);
        const errorMessage = e instanceof Error ? e.message : "unknown";
        const isConnectionError = errorMessage.toLowerCase().includes('connection') ||
            errorMessage.toLowerCase().includes('mongodb') ||
            errorMessage.toLowerCase().includes('timeout');

        return NextResponse.json({
            message: isConnectionError ? "Database connection failed" : "Event Creation Failed",
            error: errorMessage,
            details: isConnectionError ? "Check your MONGODB_URI in .env.local and ensure MongoDB is accessible" : undefined
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event fetched successfully', events }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 })
    }
}

