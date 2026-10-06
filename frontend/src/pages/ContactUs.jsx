import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BackToTop from "../components/BackToTop";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
    }, 5000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const contactMethods = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email Us",
      description: "Send us an email anytime",
      details: "support@paisable.com",
      action: "mailto:support@paisable.com",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Call Us",
      description: "Mon to Fri from 9am to 5pm",
      details: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: "Office",
      description: "Come say hello at our office",
      details: "123 Financial District, San Francisco, CA 94105",
      action: "https://maps.google.com",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      title: "Live Chat",
      description: "Instant help from our team",
      details: "Available 24/7 for premium users",
      action: "#chat",
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top
  }, []);

const faqs = [
  {
    question: "Is my financial data secure on Paisable?",
    answer:
      "Yes. Paisable uses advanced encryption (AES-256) and secure HTTPS connections to protect your data. All personal and financial details are encrypted both in transit and at rest. We never share or sell your data to anyone.",
  },
  {
    question: "Can I scan and upload receipts using Paisable?",
    answer:
      "Absolutely! Paisable integrates Google Gemini AI for OCR-based receipt scanning. Just upload a photo of your receipt, and the app automatically extracts merchant name, amount, and date, then categorizes it as a transaction.",
  },
  {
    question: "Do I need to pay to use Paisable?",
    answer:
      "No. Paisable is completely free to use for personal finance tracking. In future, we may introduce optional premium features like multi-account analytics or AI-based financial insights.",
  },
  {
    question: "Can I access my account from multiple devices?",
    answer:
      "Yes. Paisable is a web-based app, so you can securely log in from any device—desktop, tablet, or mobile browser. Your data stays synced across all devices automatically.",
  },
  {
    question: "What happens if I delete my account?",
    answer:
      "When you delete your account from the Settings page, all your data—including transactions, receipts, and analytics—is permanently erased from our servers. This action is irreversible for your privacy and security.",
  },
  {
    question: "Will there be a mobile app version?",
    answer:
      "We’re currently developing a mobile app for both iOS and Android so you can manage your finances on the go. Stay tuned for announcements on our official site!",
  },
];


  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-montserrat text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="py-4 px-8 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          Paisable
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/contact"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
          >
            Contact Us
          </Link>

          <Link
            to="/login"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Contact Us Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Contact Us
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-blue-100">
              We're here to help you take control of your finances. Get in touch
              with our team.
            </p>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <div className="rounded-md bg-green-50 dark:bg-green-900 p-4 mb-8 max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Message sent successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>
                      Thank you for contacting us. We'll get back to you within
                      24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Get in touch
                </h2>
                <p className="text-blue-100 mb-8">
                  Have questions about our financial management tools? Our team
                  is here to help you achieve your financial goals.
                </p>

                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <a
                      key={index}
                      href={method.action}
                      className="flex items-start p-4 rounded-lg hover:bg-white/10 transition-colors duration-200 group border border-transparent hover:border-white/20"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white group-hover:bg-blue-600">
                          {method.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">
                          {method.title}
                        </h3>
                        <p className="text-blue-200">{method.description}</p>
                        <p className="text-white font-medium mt-1">
                          {method.details}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Follow us
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="text-blue-200 hover:text-white transition-colors"
                    >
                      <span className="sr-only">LinkedIn</span>
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form and FAQ */}
            <div className="lg:col-span-2">
              {/* Contact Form */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-white"
                      >
                        Full name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="py-3 px-4 block w-full shadow-sm bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-white"
                      >
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="py-3 px-4 block w-full shadow-sm bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium text-white"
                    >
                      Type of inquiry
                    </label>
                    <div className="mt-1">
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general" className="text-gray-900">
                          General Inquiry
                        </option>
                        <option value="technical" className="text-gray-900">
                          Technical Support
                        </option>
                        <option value="billing" className="text-gray-900">
                          Billing Question
                        </option>
                        <option value="feature" className="text-gray-900">
                          Feature Request
                        </option>
                        <option value="partnership" className="text-gray-900">
                          Partnership
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-white"
                    >
                      Subject
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter subject"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-white"
                    >
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your message"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>

              {/* FAQ Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Frequently asked questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-white/20 rounded-lg hover:border-white/30 transition-colors"
                    >
                      <button
                        type="button"
                        className="flex justify-between items-center p-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                        onClick={() => toggleFaq(index)}
                      >
                        <span className="text-lg font-medium text-white">
                          {faq.question}
                        </span>
                        <svg
                          className={`h-5 w-5 text-blue-200 transform transition-transform ${
                            activeFaq === index ? "rotate-180" : ""
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {activeFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-blue-100">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-blue-100">
                    Still have questions?{" "}
                    <a
                      href="mailto:support@paisable.com"
                      className="font-medium text-white hover:text-blue-200 transition-colors"
                    >
                      Email our support team
                    </a>{" "}
                    or{" "}
                    <a
                      href="#chat"
                      className="font-medium text-white hover:text-blue-200 transition-colors"
                    >
                      start a live chat
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
        <p>&copy; {new Date().getFullYear()} Paisable. All Rights Reserved.</p>
      </footer>
      <BackToTop />
    </div>
  );
};

export default ContactUs;
