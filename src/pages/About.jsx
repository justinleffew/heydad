import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Info, Heart, Shield, FileText, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

const About = () => {
  const [activeTab, setActiveTab] = useState('about')

  const tabs = [
    { id: 'about', label: 'About Hey Dad', icon: Info },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'contact', label: 'Contact Us', icon: Mail }
  ]

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dad-dark">About Hey Dad</h1>
          <p className="mt-2 text-dad-olive">
            Learn more about our mission, policies, and how to get in touch.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-dad-blue-gray">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-dad-olive text-dad-olive'
                        : 'border-transparent text-dad-blue-gray hover:text-dad-dark hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-dad-blue-gray rounded-lg p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="text-center">
                <Heart className="w-16 h-16 text-dad-olive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-dad-dark mb-4">Building Bridges Between Generations</h2>
                <p className="text-dad-olive text-lg max-w-3xl mx-auto">
                  Hey Dad is more than just an app—it's a legacy platform that helps fathers create meaningful connections 
                  with their children through personalized video messages that can be unlocked at just the right moments in life.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-dad-dark mb-3">Our Mission</h3>
                  <p className="text-dad-olive mb-4">
                    We believe that every father has wisdom, love, and guidance to share with their children. 
                    Hey Dad provides a platform to capture these precious moments and ensure they reach your 
                    children exactly when they need them most.
                  </p>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Create time-locked video messages for future milestones
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Build a digital legacy that lasts generations
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Strengthen father-child relationships across time and distance
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-dad-dark mb-3">Key Features</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                      <h4 className="font-medium text-dad-dark">Smart Unlock System</h4>
                      <p className="text-sm text-dad-olive">Videos unlock based on age, date, or life milestones</p>
                    </div>
                    <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                      <h4 className="font-medium text-dad-dark">Secure Storage</h4>
                      <p className="text-sm text-dad-olive">Your videos are safely stored and encrypted</p>
                    </div>
                    <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                      <h4 className="font-medium text-dad-dark">Family Sharing</h4>
                      <p className="text-sm text-dad-olive">Connect with partners and share special moments</p>
                    </div>
                    <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                      <h4 className="font-medium text-dad-dark">Child Requests</h4>
                      <p className="text-sm text-dad-olive">Children can send private questions and requests</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-dad-blue-gray pt-6">
                <h3 className="text-xl font-semibold text-dad-dark mb-3">Version Information</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-dad-dark">App Version:</span>
                    <span className="text-dad-olive ml-2">1.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-dad-dark">Last Updated:</span>
                    <span className="text-dad-olive ml-2">December 2024</span>
                  </div>
                  <div>
                    <span className="font-medium text-dad-dark">Platform:</span>
                    <span className="text-dad-olive ml-2">Web Application</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-dad-dark mb-4">Privacy Policy</h2>
                <p className="text-dad-olive mb-2">
                  <strong>Effective Date:</strong> 5/26/2025
                </p>
                <p className="text-dad-olive mb-6">
                  <strong>Company:</strong> Hey Dad LLC
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">1. Information We Collect</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Non-personal usage data (counts of videos recorded/created/deleted, requests sent/answered)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Account info (name, email)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Child info (child's name)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Authentication data (Google, Apple, or email OAuth tokens)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Payment metadata (subscription status via Stripe)
                    </li>
                  </ul>
                  <p className="text-dad-olive mt-4 font-medium">
                    We do NOT collect or access video contents, titles, transcripts, or the children's requests themselves—they remain end-to-end encrypted.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">2. How We Use Your Data</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Service delivery: authenticate, track quotas, enable unlocks
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Analytics & product improvement: usage patterns (no access to video content)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Billing & support: manage subscriptions via Stripe
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Communications: system emails (account, billing, feature updates)
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">3. Data Sharing & Third Parties</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Stripe: payment processing (no video/content access)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Supabase (or successor): encrypted storage (we alone hold keys)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Analytics tools: aggregate metrics only—no PII or video content
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">4. Security & Encryption</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      In transit: TLS for all API calls and video uploads
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      At rest: AES-256 encryption; keys held only by dad & child
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Access controls: zero-knowledge—Hey Dad LLC cannot decrypt your videos
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">5. Children's Privacy</h3>
                  <p className="text-dad-olive mb-3">
                    This service is strictly for dads; no data is collected from users under 13.
                  </p>
                  <p className="text-dad-olive">
                    When we build the kids' app, video requests will be encrypted end-to-end; Hey Dad LLC will never see them.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">6. Data Retention & Deletion</h3>
                  <p className="text-dad-olive mb-3">
                    We retain personal and usage data as long as required by U.S. and EU law.
                  </p>
                  <p className="text-dad-olive">
                    You can request deletion of your account and all associated data at any time via your Settings.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">7. International Transfers</h3>
                  <p className="text-dad-olive mb-3">
                    Hosted in the U.S. (Wyoming).
                  </p>
                  <p className="text-dad-olive">
                    GDPR-compliant safeguards in place for any EU-origin data.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">8. Your Rights</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Access & portability: export your account metadata
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Correction & deletion: update or erase your data
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Opt-out: of analytics and marketing emails via your Settings
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">9. Changes to This Policy</h3>
                  <p className="text-dad-olive mb-3">
                    We'll post updates here with a new "Effective Date."
                  </p>
                  <p className="text-dad-olive">
                    We'll notify you by email for material changes.
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-dad-dark mb-4">Terms of Service</h2>
                <p className="text-dad-olive mb-2">
                  <strong>Effective Date:</strong> 5/26/2025
                </p>
                <p className="text-dad-olive mb-2">
                  <strong>Governing Law:</strong> Wyoming, USA
                </p>
                <p className="text-dad-olive mb-6">
                  <strong>Company:</strong> Hey Dad LLC
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">1. Acceptance</h3>
                  <p className="text-dad-olive">
                    By creating an account, you agree to these Terms and our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">2. Account & Eligibility</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Must be 18+ to register
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You alone are responsible for keeping your password and OAuth tokens secure
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">3. Subscriptions & Billing</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Access is via paid subscription (billed through Stripe)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      No refunds except as required by law
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You're responsible for taxes
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">4. Content Ownership</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You retain all rights to videos you record
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You grant Hey Dad LLC a license to store and deliver your encrypted videos to your authorized devices only
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">5. Acceptable Use</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Don't upload illegal, infringing, or harmful content
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Don't attempt to reverse-engineer, decrypt, or misuse our service
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">6. Termination</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You may cancel your subscription and delete your account at any time
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Hey Dad LLC may suspend or terminate accounts for violations of these Terms
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">7. Disclaimers & Limitation of Liability</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Service is provided "as is"
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      We disclaim all warranties to the fullest extent permitted by law
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Our total liability is limited to the amount you paid in the prior 12 months
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">8. Dispute Resolution</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Informal first: contact us, we'll try to resolve amicably
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      If unresolved, binding arbitration in Wyoming per the AAA rules
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You waive any right to a jury trial or class action
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-dad-dark mb-3">9. Changes to Terms</h3>
                  <ul className="space-y-2 text-dad-olive">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      We may revise these Terms; changes are effective upon posting
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-dad-olive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      We'll email you for any material changes
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-dad-dark mb-4">Contact Us</h2>
                <p className="text-dad-olive mb-6">
                  We'd love to hear from you. Get in touch with our team for support, feedback, or questions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-dad-olive mt-1" />
                    <div>
                      <h3 className="font-semibold text-dad-dark">Email Support</h3>
                      <p className="text-dad-olive">support@heydad.app</p>
                      <p className="text-sm text-dad-olive">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-dad-olive mt-1" />
                    <div>
                      <h3 className="font-semibold text-dad-dark">Phone Support</h3>
                      <p className="text-dad-olive">+1 (555) 123-4567</p>
                      <p className="text-sm text-dad-olive">Monday - Friday, 9 AM - 6 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-dad-olive mt-1" />
                    <div>
                      <h3 className="font-semibold text-dad-dark">Mailing Address</h3>
                      <p className="text-dad-olive">
                        Hey Dad Inc.<br />
                        123 Legacy Lane<br />
                        Family City, FC 12345<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dad-dark mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                        <h4 className="font-medium text-dad-dark text-sm">How secure are my videos?</h4>
                        <p className="text-xs text-dad-olive mt-1">
                          All videos are encrypted and stored securely in the cloud with multiple backups.
                        </p>
                      </div>
                      <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                        <h4 className="font-medium text-dad-dark text-sm">Can I change unlock conditions?</h4>
                        <p className="text-xs text-dad-olive mt-1">
                          Yes, you can modify unlock conditions for any video before it's unlocked.
                        </p>
                      </div>
                      <div className="p-3 bg-dad-blue-gray bg-opacity-10 rounded-lg">
                        <h4 className="font-medium text-dad-dark text-sm">What happens if I forget my password?</h4>
                        <p className="text-xs text-dad-olive mt-1">
                          Use the password reset feature on the login page to regain access to your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-dad-dark mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="flex items-center text-dad-olive hover:text-dad-dark">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Twitter
                      </a>
                      <a href="#" className="flex items-center text-dad-olive hover:text-dad-dark">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Facebook
                      </a>
                      <a href="#" className="flex items-center text-dad-olive hover:text-dad-dark">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default About 