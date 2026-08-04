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

interface ContactConfirmationProps {
  name?: string
  subject?: string
  message?: string
}

const ContactConfirmation = ({
  name = '',
  subject = '',
  message = '',
}: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Thanks for reaching out — your message reached Dibya Ranjan Mishra</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thanks for getting in touch</Heading>
        <Text style={value}>
          {name ? `Hi ${name},` : 'Hi there,'}
        </Text>
        <Text style={value}>
          Your message has been received. I read every enquiry personally and normally reply
          within a couple of business days.
        </Text>
        <Hr style={hr} />
        <Text style={label}>Your subject</Text>
        <Text style={value}>{subject || '—'}</Text>
        <Text style={label}>Your message</Text>
        <Text style={{ ...value, whiteSpace: 'pre-wrap' as const }}>{message || '—'}</Text>
        <Hr style={hr} />
        <Text style={muted}>
          If you need to add anything, simply reply to this email or write to
          contactme@dibyamishra.co.in.
        </Text>
        <Text style={muted}>— Dibya Ranjan Mishra</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmation,
  subject: (data: Record<string, any>) =>
    `We received your message${data.subject ? `: ${data.subject}` : ''}`,
  displayName: 'Contact Form Confirmation',
  previewData: {
    name: 'Jane Doe',
    subject: 'Advisory inquiry',
    message: 'Hi Dibya, I would love to chat about an architecture review.',
  },
} satisfies TemplateEntry

export default ContactConfirmation

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
const muted = { fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }
