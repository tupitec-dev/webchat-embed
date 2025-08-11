// src/utils/linkify.tsx
import type { ReactNode } from 'react';

interface LinkifyOptions {
  phones?: 'whatsapp' | 'tel' | 'both';
  newTab?: boolean;
}

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"')]+/i;
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

// depois — cobre 0+operadora, +55/55 e DDD+numero
const BR_PHONE_REGEX = /\b(?:0\d{2}\s?\(?\d{2}\)?\s?\d{4,5}[-.\s]?\d{4}|(?:\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}[-.\s]?\d{4})\b/;


const MASTER_REGEX = new RegExp(
  `(${URL_REGEX.source})|(${EMAIL_REGEX.source})|(${BR_PHONE_REGEX.source})`,
  'gi'
);

function normalizeUrl(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^www\./i.test(raw)) return `https://${raw}`;
  return raw;
}

function isSafeUrl(url: string) {
  return !/^javascript:/i.test(url);
}

function toWhatsappHref(phoneRaw: string) {
  const digits = phoneRaw.replace(/\D/g, '');
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

function toTelHref(phoneRaw: string) {
  const digits = phoneRaw.replace(/\D/g, '');
  return `tel:${digits}`;
}

export function linkifyText(
  text: string,
  opts: LinkifyOptions = {}
): ReactNode[] {
  const { phones = 'whatsapp', newTab = true } = opts;

  const out: ReactNode[] = [];
  let lastIndex = 0;

  text.replace(MASTER_REGEX, (match, url, email, phone, offset) => {
    if (lastIndex < (offset as number)) {
      out.push(text.slice(lastIndex, offset as number));
    }

    // dentro de linkifyText(), no ramo de URL:
    if (url) {
      // remove pontuação final (.,;:!?…) do link, mas preserva no texto
      const trailingMatch = url.match(/[.,;:!?…]+$/);
      const cleanDisplay = trailingMatch ? url.slice(0, -trailingMatch[0].length) : url;
      const trailing = trailingMatch ? trailingMatch[0] : '';

      const href = normalizeUrl(cleanDisplay);

      if (isSafeUrl(href)) {
        out.push(
          <a
            key={`u-${offset}`}
            href={href}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
          >
            {cleanDisplay}
          </a>
        );
        if (trailing) out.push(trailing); // devolve a pontuação fora do link
      } else {
        out.push(url);
      }
    } else if (email) {
      const href = `mailto:${email}`;
      out.push(
        <a
          key={`e-${offset}`}
          href={href}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
        >
          {email}
        </a>
      );
    } else if (phone) {
      if (phones === 'both') {
        out.push(
          <span key={`p-${offset}`} style={{ whiteSpace: 'nowrap' }}>
            <a
              href={toWhatsappHref(phone)}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
            >
              WhatsApp
            </a>
            {' · '}
            <a href={toTelHref(phone)}>{phone}</a>
          </span>
        );
      } else {
        const href = phones === 'whatsapp' ? toWhatsappHref(phone) : toTelHref(phone);
        out.push(
          <a
            key={`p-${offset}`}
            href={href}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
          >
            {phone}
          </a>
        );
      }
    } else {
      out.push(match);
    }

    lastIndex = (offset as number) + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }

  const withBreaks: ReactNode[] = [];
  out.forEach((chunk, i) => {
    if (typeof chunk === 'string') {
      const parts = chunk.split('\n');
      parts.forEach((p, j) => {
        if (j > 0) withBreaks.push(<br key={`br-${i}-${j}`} />);
        if (p) withBreaks.push(p);
      });
    } else {
      withBreaks.push(chunk);
    }
  });

  return withBreaks;
}
