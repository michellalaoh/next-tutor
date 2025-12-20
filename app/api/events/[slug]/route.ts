import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event, IEvent } from "@/database/event.model";

/**
 * GET /api/events/[slug]
 * 
 * Fetches a single event by its slug.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the slug
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    // Await params to get the slug value
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { 
          message: "Invalid slug parameter",
          error: "Slug is required and must be a non-empty string"
        },
        { status: 400 }
      );
    }

    // Normalize slug: trim whitespace and convert to lowercase for consistent lookup
    // (Slugs are stored in lowercase per Event model pre-save hook)
    const normalizedSlug = slug.trim().toLowerCase();

    // Connect to database
    await connectDB();

    // Query event by slug (direct match since slugs are normalized to lowercase)
    const event = await Event.findOne({ 
      slug: normalizedSlug 
    });

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found",
          error: `No event found with slug: ${slug}`
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      { 
        message: "Event fetched successfully",
        event 
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    // Log error for debugging
    console.error("Error fetching event by slug:", error);

    // Extract error message safely
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    // Check for database connection errors
    const isConnectionError = 
      errorMessage.toLowerCase().includes("connection") ||
      errorMessage.toLowerCase().includes("mongodb") ||
      errorMessage.toLowerCase().includes("timeout") ||
      errorMessage.toLowerCase().includes("network");

    // Return appropriate error response
    return NextResponse.json(
      {
        message: isConnectionError ? "Database connection failed" : "Failed to fetch event",
        error: errorMessage,
        details: isConnectionError 
          ? "Check your MONGODB_URI in .env.local and ensure MongoDB is accessible"
          : undefined
      },
      { status: 500 }
    );
  }
}

