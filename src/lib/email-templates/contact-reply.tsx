import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface ContactReplyProps {
  name?: string
  subject?: string
  reply?: string
  message?: string
}

const ContactReply = ({
  name = '',
  subject = '',
  reply = '',
  message = '',
}: ContactReplyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Reply from Dibya Ranjan Mishra${subject ? `: ${subject}` : ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{subject ? `Re: ${subject}` : 'Reply to your message'}</Heading>
        <Text style={value}>{name ? `Hi ${name},` : 'Hi there,'}</Text>
        <Text style={{ ...value, whiteSpace: 'pre-wrap' as const }}>{reply || '—'}</Text>
        <Hr style={hr} />
        {message ? (
          <>
            <Text style={label}>Your original message</Text>
            <Text style={{ ...quoted, whiteSpace: 'pre-wrap' as const }}>{message}</Text>
            <Hr style={hr} />
          </>
        ) : null}
        <Text style={muted}>
          Just reply to this email to continue the conversation, or write to
          contactme@dibyamishra.co.in.
        </Text>
        <Text style={muted}>— Dibya Ranjan Mishra</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactReply,
  subject: (data: Record<string, any>) =>
    data.subject ? `Re: ${data.subject}` : 'Reply to your message',
  displayName: 'Contact Enquiry Reply',
  previewData: {
    name: 'Jane Doe',
    subject: 'Advisory inquiry',
    reply: 'Happy to help — how does Thursday afternoon look for a 30-minute call?',
    message: 'Hi Dibya, I would love to chat about an architecture review.',
  },
} satisfies TemplateEntry

export default ContactReply

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '600px' }
const h1 = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
  margin: '0 0 20px',
}
const label = {
  fontSize: '11px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  margin: '12px 0 4px',
}
const value = {
  fontSize: '14px',
  color: '#0f172a',
  lineHeight: '1.55',
  margin: '0 0 10px',
}
const quoted = {
  fontSize: '13px',
  color: '#475569',
  lineHeight: '1.55',
  margin: '0 0 10px',
  paddingLeft: '12px',
  borderLeft: '3px solid #e2e8f0',
}
const muted = { fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }
