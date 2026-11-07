import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MessageStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "portfolio_webhook_token_2026";

/**
 * GET Handler: Meta & WeChat Webhook Verification
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Meta (WhatsApp / Facebook / Instagram) verification
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Meta Webhook Verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  // WeChat Server Validation
  const echostr = searchParams.get("echostr");
  if (echostr) {
    console.log("✅ WeChat Webhook Verified successfully!");
    return new NextResponse(echostr, { status: 200 });
  }

  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * POST Handler: Ingest messages from WhatsApp, Facebook, Instagram, WeChat, or Zapier
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Check if it's WeChat XML format
      if (rawBody.includes("<xml>")) {
        const fromUser = rawBody.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/)?.[1] || "WeChat User";
        const content = rawBody.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/)?.[1] || rawBody;
        
        await prisma.contactMessage.create({
          data: {
            name: `WeChat: ${fromUser}`,
            email: `${fromUser}@wechat.user`,
            platformSenderId: fromUser,
            channel: "WECHAT",
            subject: "New WeChat Message",
            message: content,
            status: MessageStatus.NEW,
          },
        });
        return new NextResponse("success", { status: 200 });
      }
    }

    // 1. Meta - WhatsApp Cloud API
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];
      const contact = change?.contacts?.[0];

      if (message) {
        const senderPhone = message.from;
        const senderName = contact?.profile?.name || `WhatsApp (+${senderPhone})`;
        const text = message.text?.body || `[Media/Message: ${message.type}]`;

        await prisma.contactMessage.create({
          data: {
            name: senderName,
            email: `${senderPhone}@whatsapp.user`,
            senderPhone: senderPhone,
            platformSenderId: senderPhone,
            channel: "WHATSAPP",
            subject: "WhatsApp Business Inquiry",
            message: text,
            status: MessageStatus.NEW,
            metadata: message,
          },
        });

        return NextResponse.json({ success: true, channel: "WHATSAPP" }, { status: 200 });
      }
    }

    // 2. Meta - Facebook Page Messenger
    if (body.object === "page") {
      const messaging = body.entry?.[0]?.messaging?.[0];
      if (messaging?.message) {
        const senderId = messaging.sender?.id;
        const text = messaging.message.text || "[Attachment/Media]";

        await prisma.contactMessage.create({
          data: {
            name: `Facebook User (${senderId})`,
            email: `${senderId}@facebook.user`,
            platformSenderId: senderId,
            channel: "FACEBOOK_PAGE",
            subject: "Facebook Messenger Message",
            message: text,
            status: MessageStatus.NEW,
            metadata: messaging,
          },
        });

        return NextResponse.json({ success: true, channel: "FACEBOOK_PAGE" }, { status: 200 });
      }
    }

    // 3. Meta - Instagram Direct Messaging
    if (body.object === "instagram") {
      const messaging = body.entry?.[0]?.messaging?.[0];
      if (messaging?.message) {
        const senderId = messaging.sender?.id;
        const text = messaging.message.text || "[Media/Story Reply]";

        await prisma.contactMessage.create({
          data: {
            name: `Instagram: @${senderId}`,
            email: `${senderId}@instagram.user`,
            platformSenderId: senderId,
            channel: "INSTAGRAM",
            subject: "Instagram Direct Message",
            message: text,
            status: MessageStatus.NEW,
            metadata: messaging,
          },
        });

        return NextResponse.json({ success: true, channel: "INSTAGRAM" }, { status: 200 });
      }
    }

    // 4. Custom API, Zapier, Make, n8n, or WeChat Custom Webhook
    const channel = (body.channel || "WEBSITE").toUpperCase();
    const name = body.name || body.senderName || body.from || "External Contact";
    const email = body.email || `${Date.now()}@channel.local`;
    const message = body.message || body.text || body.content || "Empty message body";
    const subject = body.subject || `${channel} Inquiry`;
    const senderPhone = body.phone || body.senderPhone || null;
    const platformSenderId = body.senderId || body.userId || body.fromId || null;

    const created = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        senderPhone,
        platformSenderId,
        channel,
        subject,
        message,
        status: MessageStatus.NEW,
        metadata: body.metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: created.id,
      channel,
    });
  } catch (err: any) {
    console.error("Webhook receiver error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
