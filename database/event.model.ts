import mongoose, { Schema, Model, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format string
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const EventSchema: Schema<IEvent> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Date cannot be empty',
      },
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Time cannot be empty',
      },
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Maximum length for generated slugs
const SLUG_MAX_LENGTH = 120;

// Generate URL-friendly slug from title, optionally with a suffix (e.g. counter)
function generateSlug(title: string, suffix?: string | number): string {
  // Base-normalization kept as-is
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  if (suffix === undefined || suffix === null || suffix === '') {
    // Enforce overall length limit on the base slug
    return base.slice(0, SLUG_MAX_LENGTH);
  }

  const suffixStr = String(suffix);
  const maxBaseLength = Math.max(SLUG_MAX_LENGTH - suffixStr.length - 1, 1); // Reserve space for `-` and suffix
  const truncatedBase = base.slice(0, maxBaseLength);

  return `${truncatedBase}-${suffixStr}`.slice(0, SLUG_MAX_LENGTH);
}

// Normalize date to ISO format if it's a valid date string
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    }
  } catch (error) {
    // If parsing fails, return original string
  }
  return dateString;
}

// Normalize time format (trim and ensure consistent format)
function normalizeTime(timeString: string): string {
  return timeString.trim();
}

// Pre-save hook: generate unique slug and normalize date/time
EventSchema.pre('save', async function () {
  // Only regenerate slug if title has changed or this is a new document
  if (this.isModified('title') || this.isNew) {
    const baseSlug = generateSlug(this.title);

    // Build a regex to find existing slugs that share this base, optionally with numeric suffixes
    const escapedBase = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const slugPattern = new RegExp(`^${escapedBase}(?:-[0-9]+)?$`, 'i');

    // Exclude current document when updating
    const query: Record<string, unknown> = { slug: slugPattern };
    if (!this.isNew && this._id) {
      query._id = { $ne: this._id };
    }

    const existing = await this.model('Event')
      .find(query, { slug: 1 })
      .lean()
      .exec();

    const existingSlugs = new Set(
      (existing as Array<{ slug?: string }>)
        .map((doc) => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string')
        .map((slug) => slug.toLowerCase())
    );

    let finalSlug = baseSlug;

    if (existingSlugs.has(baseSlug.toLowerCase())) {
      // Collision detected – iterate a numeric suffix until we find a free slug
      let counter = 2;
      // Safety upper bound; extremely unlikely to be hit
      const MAX_ATTEMPTS = 10000;

      while (counter < MAX_ATTEMPTS) {
        const candidate = generateSlug(this.title, counter);
        if (!existingSlugs.has(candidate.toLowerCase())) {
          finalSlug = candidate;
          break;
        }
        counter += 1;
      }

      // Fallback to timestamp-based suffix if we somehow exhausted the counter range
      if (finalSlug === baseSlug) {
        finalSlug = generateSlug(this.title, Date.now());
      }
    }

    this.slug = finalSlug;
  }

  // Normalize date to ISO format if it's a valid date
  if (this.isModified('date') || this.isNew) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format
  if (this.isModified('time') || this.isNew) {
    this.time = normalizeTime(this.time);
  }
});

// Unique index on slug for faster lookups
EventSchema.index({ slug: 1 }, { unique: true });

// Create and export the model
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

