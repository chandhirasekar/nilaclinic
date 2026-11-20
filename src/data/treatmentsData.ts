export interface TreatmentItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  category: 'Skin Treatments' | 'Hair Treatments';
  durationMinutes: number;
  priceINR: number;
  packagePriceINR?: number;
  packageDescription?: string;
  downtime: string;
  recommendedSessions: string;
  technology: string;
  targetConcerns: string[];
  suitableFor: string;
  overview: string;
  stepByStepProtocol: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  clinicalIndications: string[];
  contraindications: string[];
  postCareInstructions: string[];
  leadDoctor: string;
  faqList: { question: string; answer: string }[];
}

export const TREATMENTS_DATA: TreatmentItem[] = [
  {
    id: 'hydra-facial',
    slug: 'hydra-facial',
    title: 'Hydra Facial & Antioxidant Infusion',
    subtitle: 'Vortex Cleansing, Gentle Enzymatic Peel & Hyaluronic Dermal Saturation',
    image: '/images/treatments/hydra-facial.jpg',
    category: 'Skin Treatments',
    durationMinutes: 45,
    priceINR: 2499,
    packagePriceINR: 6999,
    packageDescription: 'Course of 3 sessions spaced 4 weeks apart',
    downtime: 'Zero Downtime (Immediate glow)',
    recommendedSessions: '1 session for instant glow; monthly for healthy skin',
    technology: 'Medical Vortex Hydro-Dermabrasion System',
    targetConcerns: ['Clogged pores', 'Blackheads & whiteheads', 'Dull skin', 'Dryness'],
    suitableFor: 'All skin types, ideal for monthly maintenance and pre-events',
    overview:
      'Our medical Hydra Facial cleanses, extracts, and hydrates your skin using spiraling vortex suction. It gently removes dead cells and blackheads with salicylic and glycolic acids, then deeply infuses hyaluronic acid and antioxidants for an instant, healthy glow.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Deep Cleansing & Analysis',
        description: 'Skin cleansing and Wood’s lamp diagnostic to assess hydration and oil levels.',
      },
      {
        stepNumber: 2,
        title: 'Vortex Exfoliation',
        description: 'Gentle fruit acids loosen dead skin cells and clear trapped oil.',
      },
      {
        stepNumber: 3,
        title: 'Painless Extraction',
        description: 'Gentle vacuum suction lifts out blackheads and pore debris into a collection canister.',
      },
      {
        stepNumber: 4,
        title: 'Hydration & Antioxidant Infusion',
        description: 'Deep delivery of hyaluronic acid, peptides, and vitamins to restore moisture barrier.',
      },
      {
        stepNumber: 5,
        title: 'Calming LED Light Therapy',
        description: 'Red and blue light therapy to reduce redness and soothe the skin.',
      },
    ],
    clinicalIndications: ['Dull skin', 'Congested pores', 'Uneven texture', 'Dehydration'],
    contraindications: ['Active cold sores', 'Severe sunburn', 'Open wounds'],
    postCareInstructions: [
      'Apply SPF 50+ sunscreen daily.',
      'Avoid harsh scrubs and retinol for 48 hours.',
      'Drink plenty of water to maintain skin hydration.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'How is this different from a regular salon facial?',
        answer: 'Salon facials use manual pinching that can damage skin and cause pigmentation. Our Hydra Facial uses medical-grade vortex suction and physician-approved serums with zero pain or skin trauma.',
      },
      {
        question: 'Is there any redness or peeling?',
        answer: 'No. You can return to work or social events immediately with a radiant, fresh complexion.',
      },
    ],
  },
  {
    id: 'prp-hair-restoration',
    slug: 'prp-hair-restoration',
    title: 'Autologous PRP Hair Restoration',
    subtitle: 'High-Yield Platelet Growth Factor Injections for Hair Fall & Thinning',
    image: '/images/treatments/prp-hair-restoration.jpg',
    category: 'Hair Treatments',
    durationMinutes: 60,
    priceINR: 3200,
    packagePriceINR: 14999,
    packageDescription: 'Course of 6 sessions + digital trichoscopy density tracking',
    downtime: 'Zero Downtime (Mild scalp sensitivity for a few hours)',
    recommendedSessions: '4 to 6 sessions spaced 3 to 4 weeks apart',
    technology: 'Double-Spin 3200 RPM Laboratory Centrifuge & Micro-Point Delivery',
    targetConcerns: ['Hair thinning & crown baldness', 'Excessive daily hair fall', 'Widening hair partition', 'Receding hairline'],
    suitableFor: 'Men and women suffering from early to moderate hair thinning',
    overview:
      'Platelet-Rich Plasma (PRP) uses your own blood platelets to stimulate dormant hair follicles. A small blood sample is spun in our high-precision centrifuge to extract concentrated growth factors. These are micro-injected into thinning areas of the scalp to stop hair fall, increase hair thickness, and encourage new growth.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Blood Collection & Centrifugation',
        description: '15ml of blood is collected and spun in a sterile double-spin centrifuge to isolate concentrated platelets.',
      },
      {
        stepNumber: 2,
        title: 'Scalp Disinfection & Numbing',
        description: 'Antiseptic scalp cleansing and local cooling/vibration desensitization for a comfortable experience.',
      },
      {
        stepNumber: 3,
        title: 'Targeted Micro-Injections',
        description: 'Precise micro-doses of PRP are delivered into follicle roots using ultra-fine 32G needles.',
      },
      {
        stepNumber: 4,
        title: 'Peptide Serum Seal',
        description: 'Superficial peptide infusion to soothe the scalp and nourish hair roots.',
      },
    ],
    clinicalIndications: ['Male and female pattern hair loss', 'Post-illness hair shedding', 'Thinning crown and hairline'],
    contraindications: ['Low blood platelet count', 'Active scalp infections', 'Blood thinning medications'],
    postCareInstructions: [
      'Do not wash hair for 24 hours.',
      'Avoid heavy exercise or helmets on the day of treatment.',
      'Resume topical hair serums after 48 hours.',
    ],
    leadDoctor: 'Dr. Rajesh Varma (Trichologist)',
    faqList: [
      {
        question: 'When will I see results from PRP hair treatment?',
        answer: 'Hair fall visibly reduces after the 2nd session. Measurable thickening and new baby hair growth appear after 3 to 4 sessions (around 12 to 16 weeks).',
      },
      {
        question: 'Does the injection hurt?',
        answer: 'We use ultra-fine micro-needles and vibration anesthesia. Most patients feel only mild pinpricks.',
      },
    ],
  },
  {
    id: 'q-switch-laser',
    slug: 'q-switch-laser',
    title: 'Q-Switch Laser Pigmentation Toning',
    subtitle: 'Photo-Acoustic 1064nm Laser for Melasma, Sun Spots, Tanning & Blemishes',
    image: '/images/treatments/q-switch-laser.jpg',
    category: 'Skin Treatments',
    durationMinutes: 30,
    priceINR: 3500,
    packagePriceINR: 12999,
    packageDescription: 'Course of 4 sessions including post-procedure calming mask',
    downtime: 'Zero Downtime (Mild pinkness for 1 hour)',
    recommendedSessions: '4 to 6 sessions spaced 2 to 3 weeks apart',
    technology: 'Class 4 Q-Switched Nd:YAG Laser (1064nm Top-Hat Profile)',
    targetConcerns: ['Melasma', 'Sun tan & dark patches', 'Post-acne dark marks', 'Freckles'],
    suitableFor: 'South Asian & Indian skin tones prone to pigmentation',
    overview:
      'Q-Switch Nd:YAG laser breaks down excess melanin pigment without burning the skin. Using nanosecond acoustic waves, it shatters dark melanin clusters into tiny particles that your body naturally flushes away, revealing clear, even-toned skin.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Skin Assessment & Calibration',
        description: 'Doctor measures pigmentation depth and sets safe, custom laser energy levels.',
      },
      {
        stepNumber: 2,
        title: 'Cleansing & Eye Protection',
        description: 'Thorough skin sanitization and placement of certified protective eye shields.',
      },
      {
        stepNumber: 3,
        title: 'Laser Toning Passes',
        description: 'Even passes of 1064nm laser energy shatter stubborn pigmentation without heat damage.',
      },
      {
        stepNumber: 4,
        title: 'Cooling & Barrier Mask',
        description: 'Soothing cold compress and brightening barrier serum to calm the skin.',
      },
    ],
    clinicalIndications: ['Melasma', 'Dark spots and blemishes', 'Persistent sun tanning', 'Uneven tone'],
    contraindications: ['Pregnancy', 'Active skin rash or eczema in the area', 'Current oral isotretinoin use'],
    postCareInstructions: [
      'Apply broad-spectrum sunscreen every 3 to 4 hours.',
      'Do not scrub or rub the face with rough towels.',
      'Avoid bleach or chemical waxing on treated areas for 2 weeks.',
    ],
    leadDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
    faqList: [
      {
        question: 'Can laser cause rebound darkness on Indian skin?',
        answer: 'Our top-hat Nd:YAG laser uses photo-acoustic technology rather than heat, which prevents heat-induced rebound pigmentation on Indian skin.',
      },
      {
        question: 'Does the laser hurt?',
        answer: 'It feels like a light rubber-band snap with gentle warmth. No numbing cream is needed.',
      },
    ],
  },
  {
    id: 'chemical-peel',
    slug: 'chemical-peel',
    title: 'Dermatological Chemical Peels',
    subtitle: 'Salicylic, Glycolic & Lactic Peels for Active Acne, Scars & Instant Glow',
    image: '/images/treatments/chemical-peel.jpg',
    category: 'Skin Treatments',
    durationMinutes: 30,
    priceINR: 1999,
    packagePriceINR: 5499,
    packageDescription: 'Course of 3 peeling sessions + home recovery kit',
    downtime: '1 to 2 days of mild micro-flaking (easily concealed with moisturizer)',
    recommendedSessions: '3 to 6 sessions spaced 2 to 3 weeks apart',
    technology: 'Buffered Pharmaceutical-Grade Hydroxy Acid Formulations',
    targetConcerns: ['Active pimples & acne breakouts', 'Excess oily skin', 'Acne spots & marks', 'Rough texture'],
    suitableFor: 'Oily, acne-prone, and uneven skin',
    overview:
      'Medical chemical peels gently dissolve the outermost layer of dead, dull skin cells. Formulated by dermatologists, these controlled solutions unclog congested oil glands, kill acne bacteria, fade dark blemishes, and stimulate fresh, smooth skin.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Deep Degreasing',
        description: 'Surface oils are removed so the peel penetrates evenly.',
      },
      {
        stepNumber: 2,
        title: 'Sensitive Zone Protection',
        description: 'Protective balm applied to delicate areas around the eyes, nose, and lips.',
      },
      {
        stepNumber: 3,
        title: 'Timed Peel Application',
        description: 'Application of therapeutic acid solution with constant doctor monitoring.',
      },
      {
        stepNumber: 4,
        title: 'Neutralization & Soothing',
        description: 'Sterile neutralizing solution stops peel action instantly, followed by a chilled calming mask.',
      },
    ],
    clinicalIndications: ['Acne and breakouts', 'Excess facial oiliness', 'Post-acne dark marks', 'Dullness'],
    contraindications: ['Open cuts or wounds', 'Severe eczema', 'Accutane use within 6 months'],
    postCareInstructions: [
      'Do not pick or pull flaking skin.',
      'Moisturize frequently throughout the day.',
      'Use mineral sunscreen daily.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'Will my face peel in large sheets?',
        answer: 'No. Modern medical peels cause only very fine, invisible dusting or micro-flaking that easily washes off with regular moisturizing.',
      },
      {
        question: 'How quickly does it clear acne?',
        answer: 'Active acne begins drying up within 48 to 72 hours, with noticeable reduction in oiliness and redness.',
      },
    ],
  },
  {
    id: 'rf-microneedling',
    slug: 'rf-microneedling',
    title: 'RF Microneedling & Acne Scar Subcision',
    subtitle: 'Radiofrequency Dermal Collagen Rebuilding for Ice-Pick, Rolling & Boxcar Scars',
    image: '/images/treatments/rf-microneedling.jpg',
    category: 'Skin Treatments',
    durationMinutes: 60,
    priceINR: 3500,
    packagePriceINR: 9999,
    packageDescription: 'Course of 3 sessions including cannula subcision for deep scars',
    downtime: '24 to 48 hours of mild pinkness',
    recommendedSessions: '3 to 4 sessions spaced 6 weeks apart',
    technology: 'Insulated Gold-Plated Micro-Needle Array with Bipolar Radiofrequency',
    targetConcerns: ['Deep acne scars (rolling, boxcar, ice-pick)', 'Large open pores', 'Rough skin texture', 'Skin laxity'],
    suitableFor: 'Patients seeking permanent smoothing of textured acne scars',
    overview:
      'Fractional Radiofrequency Microneedling delivers thermal collagen-stimulating energy directly into the deeper skin layers (up to 3.5mm) through gold-plated insulated needles. Combined with cannula subcision to release tethered scar roots, it triggers intense natural collagen production that permanently lifts and fills acne scars from within.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Topical Numbing Cream',
        description: 'Medical numbing cream applied for 40 minutes ensures complete procedural comfort.',
      },
      {
        stepNumber: 2,
        title: 'Subcision of Tethered Scars',
        description: 'A blunt cannula gently releases deep fibrous bands pulling down rolling scars.',
      },
      {
        stepNumber: 3,
        title: 'RF Microneedling Delivery',
        description: 'Insulated micro-pins deliver radiofrequency heat deep into the dermis to rebuild collagen.',
      },
      {
        stepNumber: 4,
        title: 'Chilled Hyaluronic Matrix',
        description: 'Application of cooling hyaluronic serum to calm the skin and speed up recovery.',
      },
    ],
    clinicalIndications: ['Post-acne scars', 'Enlarged pores', 'Textured facial scarring'],
    contraindications: ['Active cystic acne breakouts', 'Cardiac pacemaker', 'Keloid tendencies'],
    postCareInstructions: [
      'Avoid makeup for 24 to 48 hours.',
      'Wash gently with cool water and prescribed mild cleanser.',
      'Strict sunscreen use is mandatory.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'Are acne scar improvements permanent?',
        answer: 'Yes! The new collagen formed during treatment is your own living tissue, providing permanent scar elevation and skin smoothing.',
      },
      {
        question: 'Does the procedure hurt?',
        answer: 'With our strong medical numbing cream, patients feel only mild vibration and pressure.',
      },
    ],
  },
  {
    id: 'laser-hair-reduction',
    slug: 'laser-hair-reduction',
    title: 'Diode Laser Hair Reduction',
    subtitle: 'Triple-Wavelength Painless Laser for Unwanted Facial & Body Hair',
    image: '/images/treatments/diode-hair-reduction.jpg',
    category: 'Skin Treatments',
    durationMinutes: 30,
    priceINR: 2999,
    packagePriceINR: 11999,
    packageDescription: 'Course of 6 sessions for Full Face or targeted area',
    downtime: 'Zero Downtime',
    recommendedSessions: '6 to 8 sessions spaced 4 to 6 weeks apart',
    technology: 'Triple Wavelength Diode (755+808+1064nm) with -5°C Sapphire Chill-Tip',
    targetConcerns: ['Unwanted facial hair (chin, upper lip, jawline)', 'PCOS-induced thick hair', 'Underarm & body hair', 'Ingrown hair & razor bumps'],
    suitableFor: 'All Indian skin tones and hair textures',
    overview:
      'Our medical diode laser combines 3 simultaneous wavelengths (755nm + 808nm + 1064nm) to target hair roots at every depth. Equipped with a continuous -5°C sapphire chill-tip, the treatment is virtually painless and permanently destroys hair follicles without damaging surrounding skin.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Area Preparation',
        description: 'Single-use surgical prep trimmer trims hair flush with the skin for maximum laser absorption.',
      },
      {
        stepNumber: 2,
        title: 'Cooling Gel Application',
        description: 'Hypoallergenic optical cooling gel is applied for smooth glide and skin comfort.',
      },
      {
        stepNumber: 3,
        title: 'In-Motion Laser Gliding',
        description: 'The chilled laser handpiece glides over the area, gently heating and destroying hair roots.',
      },
      {
        stepNumber: 4,
        title: 'Soothing Post-Laser Emulsion',
        description: 'Gel is cleaned off and a calming aloe-zinc lotion is applied.',
      },
    ],
    clinicalIndications: ['Facial hirsutism (chin, lip, sideburns)', 'PCOS hair growth', 'Ingrown hairs'],
    contraindications: ['Waxing or plucking within 3 weeks prior (root must be present)', 'Active skin cuts or burns'],
    postCareInstructions: [
      'Avoid hot baths, saunas, and gym workouts for 24 hours.',
      'Do not pluck or wax between sessions (shaving is allowed).',
      'Apply sunscreen to exposed treated skin.',
    ],
    leadDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
    faqList: [
      {
        question: 'Is laser hair reduction permanent?',
        answer: 'Yes, it provides 85% to 95% permanent reduction of unwanted hair across completed sessions.',
      },
      {
        question: 'Can I do this if I have PCOS?',
        answer: 'Yes! Laser reduction is the most effective medical treatment for coarse, stubborn PCOS facial hair.',
      },
    ],
  },
];
