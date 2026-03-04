import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const revalidate = 86400; // Cache the result for 24 hours (86400 seconds)
export const runtime = "edge"; // Use Edge runtime for faster, cheaper execution

export async function GET(request) {
  let year, month, day;

  // Try to get the date from the query parameter (e.g., ?date=2026-03-04)
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const parts = dateParam.split("-");
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    // Fallback to server's current date
    let date = new Date();
    year = date.getFullYear();
    month = ("0" + (date.getMonth() + 1)).slice(-2);
    day = ("0" + date.getDate()).slice(-2);
  }

  let url = `https://www.nytimes.com/svc/wordle/v2/${year}-${month}-${day}.json`;

  try {
    var res = await axios.get(url);
    return new Response(JSON.stringify(res.data), {
      headers: {
        "Content-Type": "application/json",
        // Tell the browser and Vercel CDN to cache this for up to 12 hours
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Failed to fetch Wordle data:", error.message);
    return new Response(JSON.stringify({ error: "Failed to load" }), {
      status: 500,
      headers: { ...corsHeaders },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: corsHeaders,
  });
}
