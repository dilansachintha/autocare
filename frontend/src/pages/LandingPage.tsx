import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Car,
  Wrench,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  BarChart3,
  Users,
  Package,
  ChevronRight,
  Star,
  Zap,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Minus,
  Plus,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Online Appointment Booking',
    description: 'Schedule service appointments anytime, from any device. Pick your preferred date, time, and service type in seconds.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Car,
    title: 'Vehicle Management',
    description: 'Store all your vehicles in one place. Track service history, upcoming maintenance, and vehicle-specific records.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Wrench,
    title: 'Mechanic Job Tracking',
    description: 'Mechanics get clear, structured job cards with real-time status updates and direct communication with customers.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'Instant alerts for appointment confirmations, job progress, emergency updates, and payment receipts.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: CreditCard,
    title: 'Secure Online Payments',
    description: 'Pay for services online with confidence. Powered by Stripe with full payment history and receipts.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Shield,
    title: 'Emergency Service Requests',
    description: 'Broke down on the road? Submit an emergency request and get priority assistance dispatched immediately.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Admins get rich dashboards with revenue trends, appointment stats, mechanic performance, and inventory insights.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track parts and supplies with automatic low-stock alerts. Never delay a job due to missing parts again.',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    icon: Users,
    title: 'Multi-Role Access',
    description: 'Tailored experiences for customers, mechanics, and administrators — each with role-appropriate tools and views.',
    color: 'bg-pink-100 text-pink-600',
  },
];

const steps = [
  { step: '01', title: 'Create an Account', desc: 'Register as a customer in under a minute with your name, email, and password.' },
  { step: '02', title: 'Add Your Vehicle', desc: 'Enter your vehicle details — make, model, year — so we can tailor service options for you.' },
  { step: '03', title: 'Book a Service', desc: 'Choose a service type, select a convenient date and time, and confirm your appointment.' },
  { step: '04', title: 'Track & Pay', desc: 'Follow your job in real time, receive notifications, and pay securely when the service is complete.' },
];

const roles = [
  {
    icon: Car,
    role: 'For Customers',
    color: 'border-orange-500',
    accent: 'text-orange-500',
    bg: 'bg-orange-50',
    items: [
      'Book & manage service appointments',
      'Register and track multiple vehicles',
      'Real-time job status updates',
      'Secure online payment & history',
      'Submit emergency roadside requests',
      'Leave feedback and ratings',
    ],
  },
  {
    icon: Wrench,
    role: 'For Mechanics',
    color: 'border-blue-500',
    accent: 'text-blue-500',
    bg: 'bg-blue-50',
    items: [
      'View and manage assigned jobs',
      'Step-by-step job progress tracking',
      'Customer communication tools',
      'Access vehicle service history',
      'Update job status in real time',
      'Manage professional profile',
    ],
  },
  {
    icon: BarChart3,
    role: 'For Admins',
    color: 'border-purple-500',
    accent: 'text-purple-500',
    bg: 'bg-purple-50',
    items: [
      'Full appointment management',
      'User & mechanic administration',
      'Parts inventory with stock alerts',
      'Revenue analytics & reporting',
      'Emergency dispatch management',
      'System-wide oversight & control',
    ],
  },
];

const stats = [
  { value: '3', label: 'User Roles', sub: 'Customer · Mechanic · Admin' },
  { value: '10+', label: 'Service Types', sub: 'Oil change, tyres, brakes & more' },
  { value: '24/7', label: 'Emergency Support', sub: 'Always ready when you need us' },
  { value: '100%', label: 'Secure Payments', sub: 'Powered by Stripe' },
];

const testimonials = [
  {
    name: 'Nimali Perera',
    role: 'Customer',
    quote: 'Booking took less than two minutes, and I could track every update from the mechanic in real time.',
  },
  {
    name: 'Kasun Fernando',
    role: 'Mechanic',
    quote: 'The job cards are clear and organized. I spend less time on calls and more time finishing work properly.',
  },
  {
    name: 'Ravindu Jayasinghe',
    role: 'Service Center Manager',
    quote: 'AUTO CARE gave us one place for appointments, payments, and inventory. Team coordination is much better.',
  },
];

const faqs = [
  {
    q: 'Can I book appointments outside business hours?',
    a: 'Yes. Customers can book appointments 24/7, then choose an available slot based on service center schedules.',
  },
  {
    q: 'How does payment work?',
    a: 'Payments are handled through Stripe checkout. You get secure card processing and a clear payment history.',
  },
  {
    q: 'Can I manage more than one vehicle?',
    a: 'Yes. You can register and manage multiple vehicles from one customer account.',
  },
  {
    q: 'Do mechanics get notified instantly?',
    a: 'Yes. Mechanics receive job assignments and status updates in real time within their dashboard.',
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AUTO CARE</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-orange-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-orange-500 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-orange-500 transition-colors">Who It's For</a>
            <a href="#contact" className="hover:text-orange-500 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-700"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile navigation"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Link
              to="/register"
              className="hidden sm:inline-block text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="btn-primary text-sm px-5 py-2 rounded-lg"
            >
              Login
            </Link>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-4 space-y-3 text-sm font-medium">
              <a href="#features" className="block text-slate-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-slate-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>How It Works</a>
              <a href="#roles" className="block text-slate-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>Who It's For</a>
              <a href="#faq" className="block text-slate-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>FAQ</a>
              <a href="#contact" className="block text-slate-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>Contact</a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" /> Vehicle Service Management
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your Car Deserves<br />
              <span className="text-orange-400">Expert Care</span> —<br />
              Simplified.
            </h1>
            <p className="text-slate-300 text-lg max-w-xl mx-auto lg:mx-0 mb-10">
              AUTO CARE connects customers, mechanics, and administrators on one smart platform. Book services, track jobs in real time, manage inventory, and process payments — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 text-base"
              >
                Get Started Free <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
              >
                Login to Your Account
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Appointment Booked</p>
                  <p className="text-slate-400 text-xs">Oil Change + Tyre Rotation</p>
                </div>
                <span className="ml-auto badge-confirmed text-xs">Confirmed</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Vehicle', value: 'Toyota Camry 2021' },
                  { label: 'Date', value: 'Saturday, 28 Apr 2026' },
                  { label: 'Time', value: '10:00 AM' },
                  { label: 'Mechanic', value: 'James Perera' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-white font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Payment secured</span>
                </div>
                <span className="text-white font-bold text-lg">LKR 4,500</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <Bell className="w-8 h-8 text-orange-400 shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">Job In Progress</p>
                  <p className="text-slate-400 text-xs">Technician started work</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400 shrink-0" />
                <div>
                  <p className="text-white text-xs font-semibold">Rate Your Service</p>
                  <p className="text-slate-400 text-xs">Share your feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="font-semibold mt-1">{s.label}</p>
              <p className="text-orange-100 text-sm mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4">Everything You Need, Built In</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              A complete vehicle service ecosystem designed for customers who demand convenience, mechanics who need clarity, and administrators who require control.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow duration-200 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color} mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4">From Sign Up to Service in 4 Steps</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Getting your car serviced has never been easier. Here's how AUTO CARE works for customers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-1rem)] w-8 h-0.5 bg-orange-200 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-orange-200">
                    <span className="text-white font-extrabold text-lg">{s.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-orange-200"
            >
              Start Now — It's Free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Role-Based Access</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4">Built for Every Role in Your Workshop</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Whether you're a car owner, a skilled technician, or running the whole operation — AUTO CARE has you covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map(r => (
              <div key={r.role} className={`bg-white rounded-2xl border-t-4 ${r.color} shadow-sm hover:shadow-md transition-shadow p-7`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${r.bg} mb-5`}>
                  <r.icon className={`w-6 h-6 ${r.accent}`} />
                </div>
                <h3 className={`font-extrabold text-xl mb-5 ${r.accent}`}>{r.role}</h3>
                <ul className="space-y-3">
                  {r.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${r.accent}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Trusted by Teams</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4">What People Say About AUTO CARE</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Built for real workshops and real customers, with workflows that save time every day.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4">Common Questions</h2>
            <p className="text-slate-500">Everything you need to know before getting started.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={f.q} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span className="font-semibold text-slate-800">{f.q}</span>
                    {isOpen ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Clock className="w-12 h-12 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Modernise Your Service Experience?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Join AUTO CARE today. Whether you're booking your first oil change or managing a full service centre — we make it effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-orange-500/20 text-base"
            >
              Create Free Account <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Contact Us</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-3">Get in Touch</h2>
            <p className="text-slate-500">Have questions about AUTO CARE? We're here to help.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Phone, label: 'Phone', value: '+94 11 234 5678' },
              { icon: Mail, label: 'Email', value: 'support@autocare.lk' },
              { icon: MapPin, label: 'Address', value: 'Colombo 03, Sri Lanka' },
            ].map(c => (
              <div key={c.label} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <c.icon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="font-semibold text-slate-900">{c.label}</p>
                <p className="text-slate-500 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AUTO CARE</span>
          </div>
          <div className="text-sm text-center space-y-1">
            <p>© {new Date().getFullYear()} AUTO CARE. Vehicle Service Management System. All rights reserved.</p>
            <p className="text-slate-500">Project by Dilan Sachintha Wijethunga · Student No: 25021971</p>
          </div>
          <div className="flex gap-5 text-sm">
            <Link to="/login" className="hover:text-orange-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-orange-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
