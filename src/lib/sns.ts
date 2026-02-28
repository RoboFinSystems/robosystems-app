import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

interface SNSConfig {
  region: string
  contactTopicArn?: string
}

class SNSService {
  private client: SNSClient | null = null
  private config: SNSConfig

  constructor() {
    this.config = {
      region: process.env.AWS_REGION || 'us-east-1',
      contactTopicArn: process.env.SNS_CONTACT_TOPIC_ARN,
    }

    // Only initialize client if we have a topic ARN
    if (this.config.contactTopicArn) {
      this.client = new SNSClient({ region: this.config.region })
    }
  }

  async publishContactForm(data: {
    name: string
    email: string
    company?: string
    message: string
    formType: string
  }): Promise<boolean> {
    if (!this.client || !this.config.contactTopicArn) {
      console.warn('SNS not configured for contact form notifications')
      return false
    }

    try {
      const subject = `New Contact Form Submission - ${data.formType}`
      const message = `
New contact form submission received:

Type: ${data.formType}
Name: ${data.name}
Email: ${data.email}
Company: ${data.company || 'Not provided'}

Message:
${data.message}

---
Submitted at: ${new Date().toISOString()}
      `.trim()

      const command = new PublishCommand({
        TopicArn: this.config.contactTopicArn,
        Subject: subject,
        Message: message,
      })

      await this.client.send(command)
      return true
    } catch (error) {
      console.error('Failed to publish contact form to SNS:', error)
      return false
    }
  }

  async publishWaitlistForm(data: {
    firstName: string
    lastName: string
    email: string
    company: string
    role: string
    companySize: string
    interestedIn: string[]
    useCase: string
    timeline: string
  }): Promise<boolean> {
    if (!this.client || !this.config.contactTopicArn) {
      console.warn('SNS not configured for waitlist notifications')
      return false
    }

    try {
      const subject = 'New Waitlist Submission'
      const message = `
New waitlist submission received:

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Company: ${data.company}
Role: ${data.role}
Company Size: ${data.companySize}
Interested In: ${data.interestedIn.join(', ')}
Use Case: ${data.useCase}
Timeline: ${data.timeline}

---
Submitted at: ${new Date().toISOString()}
      `.trim()

      const command = new PublishCommand({
        TopicArn: this.config.contactTopicArn,
        Subject: subject,
        Message: message,
      })

      await this.client.send(command)
      return true
    } catch (error) {
      console.error('Failed to publish waitlist form to SNS:', error)
      return false
    }
  }
}

// Export singleton instance
export const snsService = new SNSService()
