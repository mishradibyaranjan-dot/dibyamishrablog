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

interface ContactNotificationProps {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const ContactNotification = ({
  name = '',
  email = '',
  subject = '',
  message = '',
}: ContactNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact form message from {name || email}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New message from your portfolio</Heading>
        <Text style={label}>From</Text>
        <Text style={value}>
          {name} &lt;{email}&gt;
        </Text>
        <Text style={label}>Subject</Text>
        <Text style={value}>{subject}</Text>
        <Hr style={hr} />
        <Text style={label}>Message</Text>
        <Text style={{ ...value, whiteSpace: 'pre-wrap' as const }}>{message}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotification,
  subject: (data: Record<string, any>) =>
    `[Portfolio Contact] ${data.subject || 'New message'}`,
  displayName: 'Contact Form Notification',
  to: 'mishra.dibyaranjan@gmail.com',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Advisory inquiry',
    message: 'Hi Dibya, I would love to chat about an architecture review.',
  },
} satisfies TemplateEntry

export default ContactNotification

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
  margin: '0 0 4px',
}
const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }
