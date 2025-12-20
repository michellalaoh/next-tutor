// If you're on Node 18+ you already have global fetch & FormData.
// If not, install undici:  npm install undici  and uncomment the next line.
// import { fetch, FormData } from "undici";

async function main() {
    const formData = new FormData();
  
    formData.append("title", "Cloud Next 2026");
    formData.append(
      "description",
      "Google’s premier cloud computing event, showcasing innovations in AI, infrastructure, and enterprise solutions."
    );
    formData.append(
      "overview",
      "Cloud Next 2025 highlights the latest in cloud-native development, Kubernetes, AI, and enterprise scalability. Developers, architects, and executives gather to learn about new Google Cloud services, best practices, and success stories."
    );
    formData.append(
      "image",
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340"
    );
    formData.append("venue", "Moscone Center");
    formData.append("location", "San Francisco, CA");
    formData.append("date", "2025-04-10");
    formData.append("time", "08:30");
    // must match your enum: 'online' | 'offline' | 'hybrid'
    formData.append("mode", "hybrid");
    formData.append(
      "audience",
      "Cloud engineers, DevOps, enterprise leaders, AI researchers"
    );
  
    // Arrays must be sent as repeated keys or in a format your API expects.
    // Since you're using Object.fromEntries(formData.entries()),
    // use JSON strings and parse later if needed.
    formData.append(
      "agenda",
      JSON.stringify([
        "08:30 AM - 09:30 AM | Keynote: AI-Driven Cloud Infrastructure",
        "09:45 AM - 11:00 AM | Deep Dives: Kubernetes, Data Analytics, Security",
        "11:15 AM - 12:30 PM | Product Demos & Networking",
        "12:30 PM - 01:30 PM | Lunch",
        "01:30 PM - 03:00 PM | Workshops: Scaling with GCP",
        "03:15 PM - 04:30 PM | Fireside Chat: The Future of Enterprise Cloud",
      ])
    );
    formData.append(
      "organizer",
      "Google Cloud organizes Cloud Next to connect global businesses, developers, and innovators with the latest technologies and best practices in cloud computing."
    );
    formData.append("tags", JSON.stringify(["Cloud", "DevOps", "Kubernetes", "AI"]));
  
    const res = await fetch("http://localhost:3000/api/events", {
      method: "POST",
      body: formData,
    });
  
    console.log("Status:", res.status);
    const data = await res.json().catch(() => null);
    console.log("Response:", data);
  }
  
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });