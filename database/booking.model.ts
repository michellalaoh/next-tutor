import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { Event } from "./event.model";

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mongoose schema for Booking model
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: Verify that the referenced event exists
 * Throws an error if the event does not exist
 */
(bookingSchema.pre as any)("save", async function (this: IBooking) {
  const event = await Event.findById(this.eventId);
  if (!event) {
    const error = new Error(
      `Event with ID ${this.eventId} does not exist`
    ) as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
});

// Create index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

/**
 * Booking model
 */
export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

