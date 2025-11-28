// supabase/functions/delete-from-s3/index.ts
import { S3Client, DeleteObjectCommand } from "npm:@aws-sdk/client-s3";
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// ENV
const AWS_REGION = Deno.env.get("AWS_REGION") ?? "us-east-1";
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
const AWS_BUCKET_NAME = Deno.env.get("AWS_BUCKET_NAME");

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET_NAME) {
  throw new Error("Missing AWS credentials or bucket name");
}

// AWS SDK client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// DELETE handler
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const key = body?.key;

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing file key" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("Deleting S3 object:", key);

    const cmd = new DeleteObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });

    await s3.send(cmd);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("S3 deletion failed:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
