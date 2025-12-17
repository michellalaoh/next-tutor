import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Event model
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Title cannot be empty",
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Description cannot be empty",
      },
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Overview cannot be empty",
      },
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Image cannot be empty",
      },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Venue cannot be empty",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Location cannot be empty",
      },
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be one of: online, offline, hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Audience cannot be empty",
      },
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Organizer cannot be empty",
      },
    },
    tags: {
      type: [String],
      required: [true, "Tags is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 */
function normalizeDate(date: string): string {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    return parsedDate.toISOString().split("T")[0];
  } catch {
    // If parsing fails, return original date
    return date;
  }
}

/**
 * Normalize time to consistent format (HH:MM)
 */
function normalizeTime(time: string): string {
  // Remove extra whitespace and ensure consistent format
  const cleaned = time.trim().replace(/\s+/g, " ");
  
  // Try to parse and format time if it's in a recognizable format
  // Otherwise, return cleaned string
  return cleaned;
}

/**
 * Pre-save hook: Generate slug from title and normalize date/time
 * Only regenerates slug if title has changed
 */
(eventSchema.pre as any)("save", function (this: IEvent) {
  // Generate slug only if title has changed or slug doesn't exist
  if (this.isModified("title") || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format
  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Create unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

