export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "React Conf 2024",
    image: "/images/event1.png",
    slug: "react-conf-2024",
    location: "Las Vegas, NV",
    date: "May 15-16, 2024",
    time: "9:00 AM - 6:00 PM"
  },
  {
    title: "Next.js Conf",
    image: "/images/event2.png",
    slug: "nextjs-conf",
    location: "San Francisco, CA",
    date: "October 25-26, 2024",
    time: "9:00 AM - 6:00 PM"
  },
  {
    title: "DevWorld Hackathon",
    image: "/images/event3.png",
    slug: "devworld-hackathon",
    location: "Austin, TX",
    date: "June 8-10, 2024",
    time: "All Day Event"
  },
  {
    title: "TypeScript Meetup",
    image: "/images/event4.png",
    slug: "typescript-meetup",
    location: "New York, NY",
    date: "April 20, 2024",
    time: "7:00 PM - 9:00 PM"
  },
  {
    title: "AWS Summit 2024",
    image: "/images/event5.png",
    slug: "aws-summit-2024",
    location: "Seattle, WA",
    date: "September 12-13, 2024",
    time: "8:00 AM - 7:00 PM"
  },
  {
    title: "Node.js Interactive",
    image: "/images/event6.png",
    slug: "nodejs-interactive",
    location: "Toronto, Canada",
    date: "November 5-6, 2024",
    time: "9:00 AM - 5:00 PM"
  }
];

