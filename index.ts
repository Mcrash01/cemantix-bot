import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    handlePreFlightRequest();
  }

  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const url: string = _req.url;
  const guess: string = url.split("/").pop() || "";
  console.log(url, guess); 

  const similarityRequestBody = JSON.stringify({
    word1: guess,
    word2: "supelec",
  });

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("http://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(`Error: ${response.statusText}`, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const result = await response.json();
    // Transformer la réponse pour qu'elle soit au format attendu par le front-end
    const value = parseFloat(result.result); // Assume que `result` a la forme { result: "0.18" }


    console.log(result);
    return new Response(JSON.stringify({value: value}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

serve(handler);