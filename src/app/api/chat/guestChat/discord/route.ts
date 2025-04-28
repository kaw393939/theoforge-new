// Send a Discord message using Discord Webhooks
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let guestInfo: Record<string, any>
  try {
    guestInfo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) {
    return NextResponse.json(
      { error: 'Discord webhook URL not configured' },
      { status: 500 }
    )
  }

  // Build the Discord message
  let message = 'New guest:'
  for (const [key, value] of Object.entries(guestInfo)) {
    if (typeof value === 'string' && value.trim()) {
      message += `\n${key}: ${value}`
    } else if (Array.isArray(value) && value.length > 0) {
      message += `\n${key}: ${value.join(', ')}`
    }
  }

  try {
    // Send to Discord
    const discordRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    })
    if (!discordRes.ok) {
      const err = await discordRes.json().catch(() => null)
      throw new Error(err?.message ?? discordRes.statusText)
    }
  } catch (err: any) {
    console.error('[Discord Webhook]', err)
    return NextResponse.json(
      { error: `Failed to send Discord message: ${err.message}` },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}