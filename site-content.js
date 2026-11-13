// Every editable piece of home-page text, grouped by home-page section.
// index.html renders from these; settings.html edits them.
//
// Field types:
//   line — single line
//   text — paragraph
//   list — one item per line
// In any field, wrap words in *asterisks* to make them italic and coloured,
// and press Enter for a line break (headings only).
(function () {
  const line = (key, label, value, extra) => ({ key, label, value, type: "line", ...extra });
  const text = (key, label, value, extra) => ({ key, label, value, type: "text", ...extra });
  const list = (key, label, value, extra) => ({ key, label, value, type: "list", ...extra });
  const group = (name, fields) => fields.map((f) => ({ ...f, group: name }));

  const SECTIONS = [
    {
      id: "brand",
      anchor: "top",
      name: "Name & contact",
      where: "The name in the menu and footer, contact details and button labels.",
      fields: [
        line("brand.name", "Name", "Swati Neha"),
        line("nav.cta", "Menu button", "Book your trial"),
        line("cta.primary", "Main button (used across the page)", "Book your bridal trial"),
        line("contact.email", "Email", "hello@swatineha.com"),
        line("contact.site", "Website", "www.swatineha.com"),
        line("contact.instagram", "Instagram handle", "@swatineha.mua"),
      ],
    },
    {
      id: "cover",
      anchor: "top",
      name: "Cover",
      where: "The very top of the home page.",
      fields: [
        line("hero.eyebrowLeft", "Small label (left)", "Makeup Artist"),
        line("hero.eyebrowRight", "Small label (right)", "/2027 Bookings Open"),
        text(
          "hero.kicker",
          "Opening question",
          "Ever looked at your wedding photos and not recognised your own face?"
        ),
        text(
          "hero.title",
          "Headline",
          "Makeup that looks like *you*, on the day it matters most.",
          { rich: true }
        ),
        text(
          "hero.body",
          "Introduction",
          "Bridal and editorial makeup built around your skin, your features and your light, so it lasts twelve hours of tears, heat and flashbulbs and still looks like you in every photo."
        ),
        line("hero.secondary", "Second link", "See the portfolio first"),
        line("hero.side", "Text beside the photo", "Bridal · Editorial · Events"),
        line("hero.signature", "Signature under the photo", "Swati Neha."),
      ],
    },
    {
      id: "proof",
      anchor: "proof",
      name: "Numbers & press",
      where: "The strip of numbers and magazine names under the cover.",
      fields: [
        ...group("Number 1", [
          line("stat1.n", "Number", "340+"),
          line("stat1.l", "Label", "brides"),
        ]),
        ...group("Number 2", [
          line("stat2.n", "Number", "9 yrs"),
          line("stat2.l", "Label", "behind the chair"),
        ]),
        ...group("Number 3", [
          line("stat3.n", "Number", "60+"),
          line("stat3.l", "Label", "editorials"),
        ]),
        line("press.label", "Press label", "Featured in"),
        list(
          "press.list",
          "Press names (one per line)",
          "The Bridal Edit\nLumière Magazine\nWedding Journal\nKohl & Co.\nStudio Nine\nAtelier Review"
        ),
      ],
    },
    {
      id: "problem",
      anchor: "problem",
      name: "Before we begin",
      where: "The dark section listing what goes wrong with wedding makeup.",
      fields: [
        line("problem.badge", "Small label", "Before we begin"),
        text("problem.title", "Heading", "If any of this sounds familiar, *you’re not alone.*", {
          rich: true,
        }),
        text(
          "problem.body",
          "Introduction",
          "Most bad wedding makeup isn’t bad makeup. It was simply built for a mirror, not for a fourteen-hour day and a photographer’s flash."
        ),
        ...group("Point 1", [
          line("pain1.title", "Title", "The trial looked perfect. The pheras did not."),
          text(
            "pain1.body",
            "Text",
            "By hour six the base had slid into your collar, your kajal had travelled south, and nobody was there to fix it before the photos."
          ),
        ]),
        ...group("Point 2", [
          line("pain2.title", "Title", "You got their signature look — on your face."),
          text(
            "pain2.body",
            "Text",
            "Same lashes, same contour, same lip as the last forty brides on their feed. Beautiful, maybe. But your mother had to look twice."
          ),
        ]),
        ...group("Point 3", [
          line("pain3.title", "Title", "The flash turned you two shades lighter."),
          text(
            "pain3.body",
            "Text",
            "In the mirror you glowed. In the album you were grey and ashy, because the products were chosen for the room, not for the camera."
          ),
        ]),
      ],
    },
    {
      id: "about",
      anchor: "about",
      name: "The approach",
      where: "The section introducing Swati, beside her photo.",
      fields: [
        line("about.eyebrow", "Small label", "The approach"),
        text("about.title", "Heading", "Your face first.\n*The trend second.*", { rich: true }),
        text(
          "about.body",
          "Text",
          "Swati starts every booking by studying you: your undertone in daylight and under tungsten, the way you smile, what you’ve hated in past photos. The look is designed from there. It isn’t pulled from a template."
        ),
        ...group("Fact 1", [
          line("fact1.k", "Label", "Trained"),
          line("fact1.v", "Value", "Pro makeup academy, 2016"),
        ]),
        ...group("Fact 2", [
          line("fact2.k", "Label", "Specialty"),
          line("fact2.v", "Value", "Long-wear & HD bridal"),
        ]),
        ...group("Fact 3", [
          line("fact3.k", "Label", "Based in"),
          line("fact3.v", "Value", "India · travels worldwide"),
        ]),
        ...group("Fact 4", [
          line("fact4.k", "Label", "Kit"),
          line("fact4.v", "Value", "Cruelty-free, skin-safe"),
        ]),
      ],
    },
    {
      id: "services",
      anchor: "services",
      name: "Services",
      where: "The three service cards.",
      fields: [
        line("services.eyebrow", "Small label", "Services"),
        text("services.title", "Heading", "Three ways to work together", { rich: true }),
        text(
          "services.aside",
          "Side note",
          "Every service begins with a call and ends with photos you’ll want to frame."
        ),
        ...group("Service 1", [
          line("svc1.side", "Side label", "Bridal Makeup"),
          line("svc1.title", "Title", "Bridal & wedding-day glam"),
          line(
            "svc1.quote",
            "Italic line",
            "“Radiant, twelve-hour makeup for a day full of memories.”"
          ),
          text(
            "svc1.body",
            "Description",
            "A full trial, a skin-prep plan four weeks out, and Swati with you through every outfit change. Your base is built in thin, sweat-proof layers, so it still looks like skin at the reception."
          ),
          list(
            "svc1.points",
            "Highlights (one per line)",
            "Pre-bridal skin consult\nUnhurried 2-hour trial\nTouch-ups between ceremonies"
          ),
        ]),
        ...group("Service 2", [
          line("svc2.side", "Side label", "Fashion Editorials"),
          line("svc2.title", "Title", "Editorial, campaign & fashion"),
          line("svc2.quote", "Italic line", "“Makeup that reads on set, in print and at 4K.”"),
          text(
            "svc2.body",
            "Description",
            "Concept boards before the shoot, colour-checked for your lighting, and fast looks between setups. Photographers book Swati because nothing needs retouching later."
          ),
          list(
            "svc2.points",
            "Highlights (one per line)",
            "Moodboard & look development\nOn-set changes in minutes\nRetouch-light skin"
          ),
        ]),
        ...group("Service 3", [
          line("svc3.side", "Side label", "Event Makeup"),
          line("svc3.title", "Title", "Engagement, sangeet & events"),
          line("svc3.quote", "Italic line", "“The soft glam you’ll want to repeat.”"),
          text(
            "svc3.body",
            "Description",
            "From a mehendi-day dewy finish to a reception smokey eye, each look matches your outfit, your venue lighting and how long the night runs. Bridal parties welcome."
          ),
          list(
            "svc3.points",
            "Highlights (one per line)",
            "Outfit-matched looks\nHair styling on request\nGroup bookings up to 8"
          ),
        ]),
      ],
    },
    {
      id: "portfolio",
      anchor: "portfolio",
      name: "Portfolio",
      where: "The “Selected looks” photo grid.",
      fields: [
        line("portfolio.eyebrowLeft", "Small label (left)", "Portfolio"),
        line("portfolio.eyebrowRight", "Small label (right)", "Selected looks"),
        text("portfolio.title", "Heading", "Same artist. *Never the same face.*", { rich: true }),
        ...group("Photo captions", [
          line("g1.label", "Photo 1", "Classic Bridal"),
          line("g2.label", "Photo 2", "Reception Smoke"),
          line("g3.label", "Photo 3", "Natural Glow"),
          line("g4.label", "Photo 4", "Soft Glam"),
          line("g5.label", "Photo 5", "Editorial Red"),
          line("g6.label", "Photo 6", "Mehendi Dewy"),
        ]),
      ],
    },
    {
      id: "quote",
      anchor: "quote",
      name: "Quote",
      where: "The dark band with a large quote and a button.",
      fields: [
        text(
          "quote.text",
          "Quote",
          "“Picture opening your album a year from now and seeing only your face, glowing. You never notice the makeup.”"
        ),
        line("quote.note", "Note beside the button", "Free 15-minute call · no deposit to talk"),
      ],
    },
    {
      id: "reviews",
      anchor: "reviews",
      name: "Kind words",
      where: "The three client reviews.",
      fields: [
        line("reviews.eyebrow", "Small label", "Kind words"),
        text("reviews.title", "Heading", "They still recognise themselves.", { rich: true }),
        ...group("Review 1", [
          text(
            "rev1.quote",
            "Review",
            "I cried through the vidaai and my makeup didn’t move. A year later I still zoom into our photos and just see me, just glowing."
          ),
          line("rev1.name", "Name", "Ananya R."),
          line("rev1.role", "Detail", "Bride · Udaipur, 2025"),
        ]),
        ...group("Review 2", [
          text(
            "rev2.quote",
            "Review",
            "Swati is the first artist I’ve booked who asks to see the lighting setup before she opens her kit. The skin came out so clean we skipped retouching."
          ),
          line("rev2.name", "Name", "Kabir Malhotra"),
          line("rev2.role", "Detail", "Fashion photographer"),
        ]),
        ...group("Review 3", [
          text(
            "rev3.quote",
            "Review",
            "She did my sangeet, my wedding and my sister’s reception. Three completely different looks, and every one of them still looked like me."
          ),
          line("rev3.name", "Name", "Meher S."),
          line("rev3.role", "Detail", "Bride · Delhi, 2024"),
        ]),
      ],
    },
    {
      id: "faq",
      anchor: "faq",
      name: "Questions",
      where: "The frequently asked questions.",
      fields: [
        line("faq.eyebrow", "Small label", "Questions"),
        text("faq.title", "Heading", "What brides ask *before* they book", { rich: true }),
        line("faq.intro", "Text before the email address", "Something else on your mind? Write to"),
        ...group("Question 1", [
          line(
            "faq1.q",
            "Question",
            "I have sensitive, acne-prone skin. Will heavy bridal makeup break me out?"
          ),
          text(
            "faq1.a",
            "Answer",
            "Bridal doesn’t have to mean heavy. Swati works with non-comedogenic, fragrance-free bases and patch-tests at your trial. You’ll also get a four-week skin-prep plan, so less product is needed on the day."
          ),
        ]),
        ...group("Question 2", [
          line("faq2.q", "Question", "How far in advance should I book?"),
          text(
            "faq2.a",
            "Answer",
            "For peak wedding season (October to February), six to nine months ahead. Editorials and events can often be booked two to four weeks out. A trial is scheduled four to six weeks before the wedding."
          ),
        ]),
        ...group("Question 3", [
          line("faq3.q", "Question", "What does it cost, and is the trial included?"),
          text(
            "faq3.a",
            "Answer",
            "Bridal packages start from ₹45,000 and include the trial, skin consult and on-day touch-ups. You get an itemised quote after a free 15-minute call, so there are no surprises."
          ),
        ]),
        ...group("Question 4", [
          line("faq4.q", "Question", "Do you travel for destination weddings?"),
          text(
            "faq4.a",
            "Answer",
            "Yes, across India and internationally. Travel and stay are quoted at cost, and Swati arrives the day before so the timeline is never at the mercy of a flight."
          ),
        ]),
      ],
    },
    {
      id: "book",
      anchor: "book",
      name: "Booking",
      where: "The booking section and enquiry form at the bottom.",
      fields: [
        line("book.badge", "Highlight label", "Only 6 bridal dates left · 2027 season"),
        text("book.title", "Heading", "Book the trial.\n*Keep the face.*", { rich: true }),
        text(
          "book.body",
          "Text",
          "Tell Swati your date and what you’re dreaming of. You’ll get a reply within 24 hours with availability, a quote and a time for your free 15-minute call. Then a trial that turns into the look you’ll see in every photo for the rest of your life."
        ),
        list(
          "book.points",
          "Promises (one per line)",
          "Reply within 24 hours\nNo deposit until you’ve had the call\nTrial credited to your bridal package"
        ),
        line("book.thanksTitle", "Thank-you heading (after sending)", "Thank you."),
        text(
          "book.thanksBody",
          "Thank-you message",
          "Swati will be in touch within 24 hours. Keep an eye on your inbox."
        ),
      ],
    },
    {
      id: "footer",
      anchor: "footer",
      name: "Footer",
      where: "The very bottom of the page.",
      fields: [
        line(
          "footer.tagline",
          "Tagline",
          "Makeup that looks like you, on the day it matters most."
        ),
      ],
    },
  ];

  const DEFAULTS = {};
  SECTIONS.forEach((s) => s.fields.forEach((f) => (DEFAULTS[f.key] = f.value)));

  // Merge saved overrides onto the defaults, ignoring unknown keys.
  const resolve = (overrides) => {
    const out = { ...DEFAULTS };
    Object.keys(overrides || {}).forEach((k) => {
      if (k in DEFAULTS && typeof overrides[k] === "string") out[k] = overrides[k];
    });
    return out;
  };

  window.SiteContent = { SECTIONS, DEFAULTS, resolve };
})();
