import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 7, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to Tivideo. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              AI-powered video script generation application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
            <p className="mb-4">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Username and email address</li>
              <li>Password (encrypted and securely stored)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 YouTube Integration</h3>
            <p className="mb-4">When you connect your YouTube account, we access:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your YouTube channel information (name, ID, subscriber count)</li>
              <li>Video upload permissions (only when you choose to upload)</li>
              <li>Basic analytics data for videos you create through our platform</li>
            </ul>
            <p className="mb-4">
              We only access this information with your explicit consent and use it solely to provide our video 
              creation and upload services.
            </p>

            <h3 className="text-xl font-semibold mb-3">2.3 Usage Information</h3>
            <p className="mb-4">We automatically collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Video scripts you generate</li>
              <li>Voice and mood preferences</li>
              <li>Media selections and project history</li>
              <li>Usage patterns and feature interactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our video script generation services</li>
              <li>Upload videos to your YouTube channel (only when you request it)</li>
              <li>Generate AI-powered content based on your preferences</li>
              <li>Improve our services and develop new features</li>
              <li>Send you important updates about our service</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encrypted password storage</li>
              <li>Secure database connections</li>
              <li>Regular security updates and monitoring</li>
              <li>Limited access to personal information by our team</li>
            </ul>
            <p>
              Your YouTube access tokens are securely stored and encrypted. We never share your YouTube 
              credentials with third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="mb-4">We integrate with the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>YouTube API:</strong> To upload videos and retrieve channel analytics</li>
              <li><strong>AI Services:</strong> To generate video scripts and content</li>
              <li><strong>Stock Media Providers:</strong> To suggest images and music for your videos</li>
            </ul>
            <p>
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Disconnect your YouTube account at any time</li>
              <li>Export your project history and scripts</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your data as long as your account is active. If you delete your account, we will 
              remove your personal information within 30 days, except where we are required by law to 
              retain certain information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. YouTube API Services</h2>
            <p className="mb-4">
              Tivideo uses YouTube API Services. By using our YouTube integration features, you agree to be 
              bound by the YouTube Terms of Service, available at{" "}
              <a 
                href="https://www.youtube.com/t/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.youtube.com/t/terms
              </a>.
            </p>
            <p className="mb-4">
              You can revoke Tivideo's access to your YouTube data via the Google security settings page at{" "}
              <a 
                href="https://security.google.com/settings/security/permissions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://security.google.com/settings/security/permissions
              </a>.
            </p>
            <p>
              The Google Privacy Policy is available at{" "}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://policies.google.com/privacy
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any significant 
              changes by email or through our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this privacy policy or how we handle your data, please contact us at:
            </p>
            <p>
              Email: <a href="mailto:privacy@tivideo.app" className="text-primary hover:underline">privacy@tivideo.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
