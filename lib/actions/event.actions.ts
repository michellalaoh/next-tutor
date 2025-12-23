'use server';

import { Event, IEvent } from "@/database/event.model";
import connectDB from "../mongodb";

export const getSilimarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).lean<IEvent>();
        if (!event) return [];

        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean<IEvent[]>();
    } catch {
        return [];
    }
}