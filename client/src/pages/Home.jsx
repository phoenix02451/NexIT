import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/swiper-overrides.css';
import { siteInfo } from '../config/siteInfo';

const INTRO_PHOTOS = [
  {
    src: '/images/intro/intro-collab-1.jpg',
    alt: 'Colleagues collaborating and discussing work together in the office',
  },
  {
    src: '/images/intro/intro-pc-1.jpg',
    alt: 'Team members focused on laptops and screens during a working session',
  },
  {
    src: '/images/intro/intro-meeting-1.jpg',
    alt: 'Business discussion around a table in a modern office',
  },
  {
    src: '/images/intro/intro-office-1.jpg',
    alt: 'People in a meeting reviewing work on a computer',
  },
  {
    src: '/images/intro/intro-pc-2.jpg',
    alt: 'Developers watching and discussing code on a monitor',
  },
  {
    src: '/images/intro/intro-discuss-1.jpg',
    alt: 'Team conversation in an open office environment',
  },
];

const TEAM_MEMBERS = [
  {
    img: '/images/pexels-andrea-piacquadio-845434.jpg',
    name: 'Schott Watkins',
    role: 'Web Developer',
  },
  {
    img: '/images/pexels-vinicius-wiesehofer-1130624.jpg',
    name: 'Nicole Bell',
    role: 'Mobile Developer',
  },
  {
    img: '/images/pexels-hussein-altameemi-2776353.jpg',
    name: 'John Doe',
    role: 'Graphic Designer',
  },
  {
    img: '/images/pexels-andrea-piacquadio-745136.jpg',
    name: 'Rose Matthews',
    role: 'Web Designer',
  },
];

const COUNTERS = [
  { icon: 'far fa-clock fa-4x', target: 13500, label: 'Working Hours' },
  { icon: 'fas fa-gift fa-4x', target: 720, label: 'Completed Projects' },
  { icon: 'fas fa-users fa-4x', target: 480, label: 'Happy Clients' },
  { icon: 'fas fa-award fa-4x', target: 120, label: 'Awards Received' },
];

const TESTIMONIALS = [
  {
    img: '/images/testimonial-1.jpg',
    name: 'James Mitchell',
    role: 'Operations Lead, Northridge Logistics',
    text: 'They rebuilt our customer portal on schedule and trained our staff so we could manage content ourselves. Support tickets dropped within the first month.',
  },
  {
    img: '/images/testimonial-2.jpg',
    name: 'Priya Sharma',
    role: 'Founder, Bloom Retail Co.',
    text: 'Clear communication from day one. The mobile experience is fast, and the checkout flow they designed actually improved our conversion rate.',
  },
  {
    img: '/images/testimonial-3.jpg',
    name: 'Daniel Ortiz',
    role: 'IT Director, Summit Health Clinics',
    text: 'Security and HIPAA-aligned hosting were non-negotiable for us. The team documented everything and delivered a stable platform we trust with patient-facing tools.',
  },
  {
    img: '/images/testimonial-4.jpg',
    name: 'Emily Carter',
    role: 'Marketing Manager, Harborline Media',
    text: 'Our new site loads quickly on phones, and the analytics dashboard they wired up helps us prove ROI to leadership every quarter.',
  },
  {
    img: '/images/testimonial-5.jpg',
    name: 'Marcus Webb',
    role: 'CEO, Webb & Sons Construction',
    text: 'We needed something simple our crews could use in the field. The progressive web app works offline where signal is weak—exactly what we asked for.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How much will it cost?',
    a: "To get a better idea of the cost of what you want to build, give us a quick phone call. We'll ask you a few questions about the nature of the site, what sort of interactivity the site will have, your graphic design needs, etc. Then we'll be able to give you a ballpark figure. If you're still interested, we'll come to your place of business and come up with a firm quote.",
  },
  {
    q: 'How long it takes to design?',
    a: 'The time limit of any assignment is normally dictated by the client. If you have any time limit in mind we will attempt to assemble it for you. The main general delay in the making of a website is waiting for the content of the pages to be sent to us by the client.',
  },
  {
    q: `How do I associate with ${siteInfo.companyName}?`,
    a: 'The process begins when you contact us with your requirements. We analyze your requirements and respond to you. On the basis of the further discussion, you can choose an engagement model that suits you the best. After that, we begin the process of development.',
  },
  {
    q: 'Can you help my current site look more professional?',
    a: 'Yes. Give us your requirements and we have experienced expertise to help you give a new professional look that really wonders!',
  },
  {
    q: 'When do I pay?',
    a: 'For most projects, equal payments are made at the start, midway, and the end of the project, but we can work with you to set up a schedule that meets your needs. We understand that this is a big investment and want to help you budget for the expense in whatever way possible. We accept checks, PayPal, and all major credit cards.',
  },
];

function CounterBox({ icon, target, label }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const timeoutRef = { current: null };
    const speed = 120;
    let count = 0;
    const tick = () => {
      if (cancelled) return;
      const inc = target / speed;
      count += inc;
      if (count >= target) {
        setN(target);
        return;
      }
      setN(Math.floor(count));
      timeoutRef.current = setTimeout(tick, 1);
    };
    timeoutRef.current = setTimeout(tick, 1);
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, [target]);
  return (
    <div>
      <i className={icon} />
      <div className="counter">{n}</div>
      <h3>{label}</h3>
    </div>
  );
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState(-1);

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (hash) {
      const t = setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <section id="home" className="home">
        <h1>Bring your Business Online</h1>
        <h2>with {siteInfo.companyName} services</h2>
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
      </section>

      <section id="about" className="about">
        <h1 className="heading">about us</h1>
        <div className="row">
          <div className="content">
            <h3>We make creativity work for your brand!</h3>
            <p>
              Ours is a team of creatives that is brainstorming on great ideas,
              <b> all. the. time.</b>
              <br />
              With our skills put together, you get an ensemble capable of doing anything and everything your brand
              needs.
            </p>
            <a href="#about">
              <button type="button" className="btn">
                Read More
              </button>
            </a>
          </div>
        </div>
      </section>

      <div className="pt-5 pb-5" style={{ backgroundColor: '#f2f2f2' }}>
        <div className="container">
          <div className="row">
            <div className="section-head col-sm-12" id="service">
              <h1>Our Services</h1>
              <p>
                We help you to build high-quality digital solutions and products as well as deliver a wide range of
                related professional services. We are providing world-class service to our clients.
              </p>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="item">
                <span className="icon feature_box_col_one">
                  <i className="fa fa-laptop" />
                </span>
                <h6>Web App Development</h6>
                <p>
                  Our Custom Web Development Services Include Both Front-End And Back-End Development. Whether It Is
                  Enhancing An Existing App Or Architecting An Enterprise App, Our Developers Are Up For The Challenge.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="item">
                <span className="icon feature_box_col_two">
                  <i className="fa fa-android" />
                </span>
                <h6>Mobile App Development</h6>
                <p>
                  We Have Expertise In Creating Multi-Platform Mobile App Solutions For Both Android And IOS Devices.
                  Using PhoneGap, Xamarin, And React Native, We Offer Custom Mobile App That Runs Smoothly On Multiple
                  Platforms.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="item">
                <span className="icon feature_box_col_three">
                  <i className="fa fa-magic" />
                </span>
                <h6>Digital Marketing</h6>
                <p>
                  The digital marketing services that we provide have their own set of charms. By taking our digital
                  marketing services, our clients will be able to increase visibility and engage with their customers at
                  the online platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="counters">
        <div className="container">
          {COUNTERS.map((c) => (
            <CounterBox key={c.label} {...c} />
          ))}
        </div>
      </section>

      <div className="communicate">
        <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit.</h3>
        <p>Lorem ipsum dolor sit amet.</p>
        <a href="#footer-contact">
          <button type="button" className="btn">
            Contact Now
          </button>
        </a>
      </div>

      <div className="testimonials mt-100">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2 className="testimonials-heading">Testimonials</h2>
            <p className="testimonials-sub">See what people have to say about us</p>
          </div>
          <Swiper
            className="testimonials-swiper"
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3500 }}
            loop
            pagination={{ clickable: true }}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
            }}
          >
            {TESTIMONIALS.map((t) => (
              <SwiperSlide key={t.name}>
                <div className="testimonial-item testimonial-card-vertical">
                  <div className="testimonial-img">
                    <img src={t.img} alt={t.name} />
                  </div>
                  <div className="testimonial-text">
                    <h3>{t.name}</h3>
                    <h4>{t.role}</h4>
                    <p>{t.text}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div id="introduce" className="clients mt-100 introduce-section">
        <div className="container">
          <div className="section-header">
            <h2>Introduce</h2>
            <p>
              A glimpse into how we work together in the office—planning on the whiteboard, discussing around the
              table, and shipping product side by side at the screen.
            </p>
          </div>
          <Swiper
            className="clients-swiper introduce-swiper"
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3200 }}
            loop
            pagination={{ clickable: true }}
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
            }}
          >
            {INTRO_PHOTOS.map((photo) => (
              <SwiperSlide key={photo.src}>
                <figure className="introduce-slide-figure">
                  <img className="introduce-slide-img" src={photo.src} alt={photo.alt} loading="lazy" />
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <section className="team team-compact" id="team">
        <h1 className="heading team-heading-compact">our team</h1>
        <div className="team-cards-row">
          {TEAM_MEMBERS.map((member) => (
            <div className="row" key={member.name}>
              <div className="card">
                <div className="image">
                  <img src={member.img} alt={member.name} />
                </div>
                <div className="info">
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                  <div className="icons">
                    <a href="https://www.facebook.com/" className="fab fa-facebook-f" aria-label="Facebook" />
                    <a href="https://twitter.com/login" className="fab fa-twitter" aria-label="Twitter" />
                    <a href="https://www.instagram.com/" className="fab fa-instagram" aria-label="Instagram" />
                    <a href="https://www.linkedin.com/" className="fab fa-linkedin" aria-label="LinkedIn" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="faq faq-modern" id="faq">
        <div className="faq-modern-overlay">
          <div className="container faq-modern-container">
            <header className="faq-modern-intro">
              <span className="faq-modern-badge">Answers</span>
              <h2 className="faq-modern-heading">Frequently asked</h2>
              <p className="faq-modern-lead">
                Straight answers on timelines, pricing, and how we work—before you commit to a project.
              </p>
            </header>
            <div className="row faq-modern-row">
              <div className="col-12 col-lg-10 offset-lg-1">
                <div className="faq-modern-shell">
                  <div className="faq-accordion">
                  {FAQ_ITEMS.map((item, idx) => (
                    <div className={`faq-item ${faqOpen === idx ? 'is-open' : ''}`} key={item.q}>
                      <button
                        type="button"
                        className="faq-item-trigger"
                        aria-expanded={faqOpen === idx}
                        onClick={() => setFaqOpen(faqOpen === idx ? -1 : idx)}
                      >
                        <span className="faq-item-question">{item.q}</span>
                        <span className="faq-item-chevron" aria-hidden />
                      </button>
                      <div className="faq-item-panel" role="region">
                        <div className="faq-item-panel-inner">
                          <p>{item.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
