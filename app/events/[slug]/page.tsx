import EventDetails from "@/components/EventDetails";
import { Suspense } from "react";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = params.then((p) => p.slug);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventDetails params={slug} />
    </Suspense>
  )
}

export default EventDetailsPage