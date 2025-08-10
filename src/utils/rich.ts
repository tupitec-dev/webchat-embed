// src/utils/rich.ts
import React from 'react';

/** Remove tudo que não é dígito. */
const onlyDigits = (s: string) => s.replace(/\D/g, '');

/** Extrai dígitos de um link do WhatsApp (wa.me / api.whatsapp.com). */
export function extractWhatsappDigits(whatsappLink?: string): string | null {
  if (!whatsappLink) return null;
  const digits = onlyDigits(whatsappLink);
  return digits || null;
}

/**
 * Tenta obter o número oficial de WhatsApp a partir do objeto de informações da empresa.
 */
export function getWhatsappDigitsFromInfo(
  informacoes?: Record<string, string>
): string | null {
  if (!informacoes) return null;

  if (informacoes.whatsappLink) {
    const d = extractWhatsappDigits(informacoes.whatsappLink);
    if (d) return d.startsWith('55') ? d : `55${d}`;
  }

  const candidates = [
    'whatsapp',
    'telefoneWhatsapp',
    'celularWhatsapp',
    'zap',
    'whats',
  ];
  for (const key of candidates) {
    const val = informacoes[key];
    if (val) {
      const d = onlyDigits(val);
      if (d.length >= 10) {
        return d.startsWith('55') ? d : `55${d}`;
      }
    }
  }

  return null;
}

/** Opções de renderização. */
export type RenderRichTextOptions = {
  defaultCountry?: string;
  whatsappDigits?: string | null;
};

/**
 * Transforma um texto puro em uma lista de React nodes com links clicáveis.
 */
export function renderRichText(
  text: string,
  opts: RenderRichTextOptions = {}
): React.ReactNode[] {
  const { defaultCountry = '55', whatsappDigits = null } = opts;

  if (!text) return [];

  // Escape básico
  const escaped = text.replace(/[<>&]/g, (ch) => {
    switch (ch) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      default: return ch;
    }
  });

  // Regex
  const URL = /\bhttps?:\/\/[^\s<]+/gi;
  const BARE_URL = /\bwww\.[^\s<]+/gi;
  const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const PHONE = /\b(?:\(?\d{2}\)?\s*)?\d{4,5}[- ]?\d{4}\b/gi;

  const nodes: React.ReactNode[] = [];
  let key = 0;

  /** Linkifica e-mails e telefones em um trecho sem URLs */
  const linkifyMailAndPhone = (segment: string) => {
    let last = 0;
    const COMBINED = new RegExp(`${EMAIL.source}|${PHONE.source}`, 'gi');

    segment.replace(COMBINED, (match, offset: number) => {
      if (offset > last) nodes.push(segment.slice(last, offset));

      if (/@/.test(match)) {
        // E-mail
        nodes.push(
          React.createElement(
            'a',
            {
              key: `m${key++}`,
              href: `mailto:${match}`,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            match
          )
        );
      } else {
        // Telefone
        const startsWithPlus = /^\+/.test(match);
        const rawDigits = onlyDigits(match);
        const withDDI = startsWithPlus
          ? rawDigits
          : (rawDigits.length === 10 || rawDigits.length === 11
              ? `${defaultCountry}${rawDigits}`
              : rawDigits);

        const isWhats =
          !!whatsappDigits &&
          (withDDI.endsWith(whatsappDigits) || whatsappDigits.endsWith(withDDI));

        const href = isWhats ? `https://wa.me/${whatsappDigits}` : `tel:+${withDDI}`;

        nodes.push(
          React.createElement(
            'a',
            {
              key: `p${key++}`,
              href,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            match
          )
        );
      }

      last = offset + match.length;
      return match;
    });

    if (last < segment.length) nodes.push(segment.slice(last));
  };

  // 1) URLs com protocolo
  let last = 0;
  escaped.replace(URL, (url, offset: number) => {
    if (offset > last) linkifyMailAndPhone(escaped.slice(last, offset));

    nodes.push(
      React.createElement(
        'a',
        {
          key: `u${key++}`,
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        url
      )
    );

    last = offset + url.length;
    return url;
  });

  // 2) URLs sem protocolo (www...) no trecho restante
  const tail = escaped.slice(last);
  let subLast = 0;
  tail.replace(BARE_URL, (url, offset: number) => {
    if (offset > subLast) linkifyMailAndPhone(tail.slice(subLast, offset));

    const href = `https://${url}`;
    nodes.push(
      React.createElement(
        'a',
        {
          key: `w${key++}`,
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        url
      )
    );

    subLast = offset + url.length;
    return url;
  });

  if (subLast < tail.length) linkifyMailAndPhone(tail.slice(subLast));

  return nodes;
}
