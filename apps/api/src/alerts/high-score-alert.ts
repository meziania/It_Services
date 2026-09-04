import { Logger } from '@nestjs/common';

const logger = new Logger('HighScoreAlert');

export interface HighScoreOfferPayload {
  id: string;
  title: string;
  matchScore: number;
  url: string;
  platform: string;
}

/**
 * Fires when a newly created offer scores at/above HIGH_SCORE_THRESHOLD
 * (default 70). Logs always; POSTs to ALERT_WEBHOOK_URL when configured
 * (Discord/Slack/n8n/Make).
 */
export async function notifyHighScoreOffer(offer: HighScoreOfferPayload): Promise<void> {
  const threshold = Number(process.env.HIGH_SCORE_THRESHOLD ?? 70);
  if (!Number.isFinite(threshold) || offer.matchScore < threshold) return;

  logger.log(
    `High-score alert (${offer.matchScore}): [${offer.platform}] ${offer.title} — ${offer.url}`,
  );

  const webhook = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!webhook) return;

  try {
    const appUrl = process.env.APP_PUBLIC_URL ?? 'https://serviceit-scanner.vercel.app';
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🎯 Score ${offer.matchScore} — **${offer.title}** (${offer.platform})\n${offer.url}\n${appUrl}/opportunities/${offer.id}`,
        embeds: [
          {
            title: offer.title,
            url: `${appUrl}/opportunities/${offer.id}`,
            description: `Score **${offer.matchScore}** · ${offer.platform}`,
            color: 0x0d9488,
          },
        ],
        offer,
      }),
    });
  } catch (error) {
    logger.warn(
      `ALERT_WEBHOOK_URL failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
