import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let url = `https://www.nytimes.com/svc/wordle/v2/${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}.json`;

  var res = await axios.get(url);
  return new Response(JSON.stringify(res.data), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: corsHeaders,
  });
}
