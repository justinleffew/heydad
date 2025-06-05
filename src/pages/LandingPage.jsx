import React, { useState, useEffect } from 'react';

const DARK_BLUE = '#15202F';
const TAN = '#D4B996';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFaqClick = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#15202F]">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 bg-[#15202F] flex items-center justify-between px-4 md:px-6 z-50 transition-all duration-200 ${
        isScrolled ? 'h-12 shadow-[0_0_8px_rgba(0,0,0,0.25)]' : 'h-[80px]'
      }`}>
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/images/finallogo.PNG"
            alt="Hey Dad Logo"
            className={`w-auto transition-all duration-200 ${
              isScrolled ? 'h-10' : 'h-12'
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-8">
          <a href="/login" className="text-white text-sm md:text-base font-medium tracking-wider hover:underline hover:underline-offset-4 hover:decoration-[#D4B996] transition-all duration-200">
            LOG IN
          </a>
          <a href="/signup" className="bg-[#D4B996] text-white text-sm md:text-base font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-[#C2A16C] transition-all duration-200">
            SIGN UP
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center pt-[80px] px-4 md:px-6">
        <div className="max-w-[600px] mx-auto text-center">
          {/* Headline */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[36px] font-bold text-white mb-3 leading-tight">
            Always Be There—Even When You Can't.
          </h1>
          
          {/* Subheadline */}
          <p className="text-[#D4B996] text-base md:text-lg mb-6 leading-relaxed max-w-[500px] mx-auto">
            Record advice and stories now, unlock them at any age or milestone—so you can be with your kids forever, even when you can't.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-[#D4B996] text-white text-base font-semibold px-6 py-3 rounded-lg hover:bg-[#C2A16C] transition-all duration-200 w-full sm:w-auto"
            >
              Sign Up Now
            </a>
            <a
              href="/gift"
              className="border border-[#D4B996] text-[#D4B996] text-base font-semibold px-6 py-3 rounded-lg hover:bg-[#D4B996] hover:text-white transition-all duration-200 w-full sm:w-auto"
            >
              Buy as Gift
            </a>
          </div>
        </div>
      </section>

      {/* What is Hey Dad Section */}
      <section id="about" className="bg-[#1A2A3B] py-[60px] scroll-mt-[80px] px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="font-serif text-2xl md:text-[28px] font-bold text-white mb-6 text-center">
            What Is Hey Dad?
          </h2>
          <p className="text-base md:text-lg text-white max-w-[600px] mx-auto text-center leading-relaxed">
            Hey Dad helps you record short videos of advice, stories, and life lessons that unlock at any milestone— birthdays, graduations, first dates, or whenever your kids need you most.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#15202F] py-[80px] scroll-mt-[80px] px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="font-serif text-2xl md:text-[28px] font-bold text-[#D4B996] mb-12 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-[32px] max-w-[900px] mx-auto">
            {/* Card 1 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg shadow-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-md md:hover:shadow-lg">
              <div className="w-5 h-5 mx-auto mb-4 text-[#D4B996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#15202F] mb-2 text-center">
                Record Your Message
              </h3>
              <p className="text-[14px] text-[#15202F] text-center leading-relaxed">
                Use your phone or computer to capture a quick video—no tech expertise needed.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg shadow-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-md md:hover:shadow-lg">
              <div className="w-5 h-5 mx-auto mb-4 text-[#D4B996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#15202F] mb-2 text-center">
                Schedule Unlock Moments
              </h3>
              <p className="text-[14px] text-[#15202F] text-center leading-relaxed">
                Pick birthdays, graduations, or any milestone. Your message unlocks automatically.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg shadow-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-md md:hover:shadow-lg">
              <div className="w-5 h-5 mx-auto mb-4 text-[#D4B996]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-[#15202F] mb-2 text-center">
                Be There Forever
              </h3>
              <p className="text-[14px] text-[#15202F] text-center leading-relaxed">
                Your kids see and hear from you at exactly the right time—even if you're not there.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-10">
            <a
              href="/signup"
              className="bg-[#D4B996] text-white text-base font-semibold px-6 py-3 rounded-lg hover:bg-[#c4a986] transition-colors inline-block"
            >
              Sign Up to Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section id="benefits" className="bg-[#15202F] py-[80px] px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="font-serif text-2xl md:text-[28px] font-bold text-white mb-12 text-center">
            Key Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-[24px] max-w-[1000px] mx-auto">
            {/* Benefit 1 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg flex items-start gap-4 max-w-[320px] mx-auto md:mx-0">
              <div className="w-6 h-6 text-[#D4B996] flex-shrink-0">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15202F] mb-1">
                  Legacy of Love
                </h3>
                <p className="text-[14px] text-[#15202F] leading-relaxed">
                  Capture your wisdom and life lessons so they become part of your child's story.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg flex items-start gap-4 max-w-[320px] mx-auto md:mx-0">
              <div className="w-6 h-6 text-[#D4B996] flex-shrink-0">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15202F] mb-1">
                  Peace of Mind
                </h3>
                <p className="text-[14px] text-[#15202F] leading-relaxed">
                  Know your kids will hear from you on the days that matter most.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-[#F5F0E8] p-4 rounded-lg flex items-start gap-4 max-w-[320px] mx-auto md:mx-0">
              <div className="w-6 h-6 text-[#D4B996] flex-shrink-0">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#15202F] mb-1">
                  Perfect Gift
                </h3>
                <p className="text-[14px] text-[#15202F] leading-relaxed">
                  Give Dad (or Mom) the chance to leave a lasting memory—ideal for Father's Day or birthdays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Father's Day Callout */}
      <section className="bg-[#D0AA7D] py-10 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-xl md:text-[24px] font-bold text-[#15202F] mb-2">
            Give the Gift of Your Voice.
          </h2>
          <p className="text-sm md:text-[16px] text-[#15202F] mb-6">
            Father's Day is around the corner—let Dad record memories that last forever.
          </p>
          <a
            href="/gift"
            className="bg-[#15202F] text-white text-sm md:text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-[#1A2A3B] transition-all duration-200 inline-block w-full sm:w-auto"
          >
            Buy as Gift for Father's Day
          </a>
          <p className="text-[12px] italic text-[#15202F] mt-2">
            Valid through June 21
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#0F1A27] py-[80px] scroll-mt-[80px] px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="font-serif text-2xl md:text-[28px] font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-[600px] mx-auto">
            {/* FAQ Items */}
            <div className="border-b border-[#2A3B4C]">
              <details 
                className="group"
                open={openFaq === 0}
                onClick={() => handleFaqClick(0)}
              >
                <summary className="flex justify-between items-center py-6 cursor-pointer">
                  <span className="text-[16px] font-semibold text-white">How do I send Hey Dad as a gift?</span>
                  <span className="text-[#D4B996] text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <div className="overflow-hidden transition-all duration-300">
                  <p className="text-[#F5F0E8] text-[14px] py-4">
                    Click 'Buy as Gift' in the header (or below). Purchase a gift code via Stripe. We'll email the code to you or schedule it to arrive on any date you choose.
                  </p>
                </div>
              </details>
            </div>

            <div className="border-b border-[#2A3B4C]">
              <details 
                className="group"
                open={openFaq === 1}
                onClick={() => handleFaqClick(1)}
              >
                <summary className="flex justify-between items-center py-6 cursor-pointer">
                  <span className="text-[16px] font-semibold text-white">Can I update my videos after I record them?</span>
                  <span className="text-[#D4B996] text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <div className="overflow-hidden transition-all duration-300">
                  <p className="text-[#F5F0E8] text-[14px] py-4">
                    Absolutely. Log in anytime, swap out old videos, or add new ones—both you and your recipient can manage content on the same dashboard.
                  </p>
                </div>
              </details>
            </div>

            <div className="border-b border-[#2A3B4C]">
              <details 
                className="group"
                open={openFaq === 2}
                onClick={() => handleFaqClick(2)}
              >
                <summary className="flex justify-between items-center py-6 cursor-pointer">
                  <span className="text-[16px] font-semibold text-white">Is my data safe and private?</span>
                  <span className="text-[#D4B996] text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <div className="overflow-hidden transition-all duration-300">
                  <p className="text-[#F5F0E8] text-[14px] py-4">
                    Yes. All videos are encrypted at rest and in transit. Only you and your chosen recipients can view them, and you can delete at any time.
                  </p>
                </div>
              </details>
            </div>

            <div className="border-b border-[#2A3B4C]">
              <details 
                className="group"
                open={openFaq === 3}
                onClick={() => handleFaqClick(3)}
              >
                <summary className="flex justify-between items-center py-6 cursor-pointer">
                  <span className="text-[16px] font-semibold text-white">What if my child doesn't have my phone number?</span>
                  <span className="text-[#D4B996] text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <div className="overflow-hidden transition-all duration-300">
                  <p className="text-[#F5F0E8] text-[14px] py-4">
                    Videos unlock inside their Hey Dad account—no phone number needed. They just enter their unique access code on our site.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#15202F] py-[80px] px-4 md:px-6">
        <div className="container mx-auto">
          <h2 className="font-serif text-2xl md:text-[28px] font-bold text-[#D4B996] mb-12 text-center">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[24px] max-w-[700px] mx-auto">
            {/* Monthly Plan */}
            <div className="bg-[#F5F0E8] p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-[24px] font-bold text-[#15202F] text-center mb-4">
                $4.99 / month
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="text-[14px] text-[#15202F]">• Unlimited video messages</li>
                <li className="text-[14px] text-[#15202F]">• Unlimited milestone scheduling</li>
                <li className="text-[14px] text-[#15202F]">• Secure, ad-free experience</li>
                <li className="text-[14px] text-[#15202F]">• Edit or delete messages anytime</li>
                <li className="text-[14px] text-[#15202F]">• Cloud storage for all videos</li>
              </ul>
              <a
                href="/signup?plan=monthly"
                className="block w-full bg-[#15202F] text-white text-[14px] font-semibold px-6 py-3 rounded-lg text-center hover:bg-[#1A2A3B] transition-colors"
              >
                Get Monthly
              </a>
            </div>

            {/* Annual Plan */}
            <div className="bg-[#F5F0E8] p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-[24px] font-bold text-[#15202F] text-center mb-4">
                $39.99 / year
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="text-[14px] text-[#15202F]">• Everything in Monthly plan</li>
                <li className="text-[14px] text-[#15202F]">• Save 33% vs monthly</li>
                <li className="text-[14px] text-[#15202F]">• Priority customer support</li>
                <li className="text-[14px] text-[#15202F]">• Early access to new features</li>
                <li className="text-[14px] text-[#15202F]">• Advanced video quality options</li>
              </ul>
              <a
                href="/signup?plan=annual"
                className="block w-full bg-[#15202F] text-white text-[14px] font-semibold px-6 py-3 rounded-lg text-center hover:bg-[#1A2A3B] transition-colors"
              >
                Get Annual
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-[#D0AA7D] py-[60px] px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h2 className="font-serif text-xl md:text-[24px] font-bold text-[#15202F] mb-6">
            Ready to Be With Your Kids Forever?
          </h2>
          <a
            href="/signup"
            className="bg-[#15202F] text-white text-sm md:text-[16px] font-semibold px-6 py-3 rounded-lg hover:bg-[#1A2A3B] transition-all duration-200 inline-block w-full sm:w-auto"
          >
            Sign Up Now
          </a>
          <p className="text-sm md:text-[14px] text-[#15202F] mt-6">
            Already purchased a gift code?{' '}
            <a href="/login" className="underline hover:text-[#1A2A3B] transition-colors duration-200">
              Log In
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1A27] py-10 px-4 md:px-6">
        <div className="container mx-auto">
          <nav className="flex flex-wrap justify-center gap-2 mb-2">
            <a href="#hero" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Home
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="#about" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              About
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="#how-it-works" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              How It Works
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="#benefits" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Benefits
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="#pricing" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Pricing
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="/signup" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Sign Up
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="/privacy" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="text-white text-[14px]">|</span>
            <a href="/terms" className="text-white text-[14px] hover:text-[#D0AA7D] transition-colors duration-200">
              Terms of Service
            </a>
          </nav>
          <p className="text-center text-white text-[14px] mb-2">
            © 2025 Hey Dad. All rights reserved.
          </p>
          <p className="text-center text-[#A0A0A0] text-[12px] italic">
            Designed for dads & moms who want to leave a legacy of love.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 