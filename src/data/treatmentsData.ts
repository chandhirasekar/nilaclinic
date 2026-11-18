export interface TreatmentItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'Skin Care' | 'Laser Treatments' | 'Hair & Scalp' | 'Anti-Aging & Scars';
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
    subtitle: 'Triple-Stage Vortex Cleansing, Gentle Enzymatic Peel & Hyaluronic Dermal Saturation',
    category: 'Skin Care',
    durationMinutes: 45,
    priceINR: 2499,
    packagePriceINR: 6999,
    packageDescription: 'Course of 3 sessions spaced 4 weeks apart',
    downtime: 'Zero Downtime (Immediate radiance)',
    recommendedSessions: 'Single treatment for instant clarity; monthly for sustained sebum regulation',
    technology: 'Medical-Grade Vortex Hydro-Dermabrasion System with Closed-Loop Vacuum Extraction',
    targetConcerns: ['Sebum congestion', 'Enlarged comedones', 'Dullness & uneven texture', 'Dehydration'],
    suitableFor: 'All Fitzpatrick skin types (I to VI), ideal before key events or as monthly maintenance',
    overview:
      'Unlike conventional manual salon extractions that cause capillary rupture and micro-tears, our clinical Hydra Facial utilizes continuous spiraling fluid vortex technology. It dislodges keratinized plugs with a 2% salicylic and glycolic acid solution before infusing low-molecular-weight hyaluronic acid, niacinamide, and green tea polyphenols directly into the dermal-epidermal junction.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Diagnostic Wood’s Lamp & Cleansing',
        description: 'Double cleanse with medical surfactant followed by 365nm UV Wood’s lamp diagnostic to map subsurface sebum distribution and dehydration zones.',
      },
      {
        stepNumber: 2,
        title: 'Vortex Hydro-Exfoliation',
        description: 'Application of buffered Alpha & Beta Hydroxy acids under controlled negative pressure to loosen stubborn comedones without mechanical pinching.',
      },
      {
        stepNumber: 3,
        title: 'Vacuum Comedone Extraction',
        description: 'Vortex suction evacuates oxidized sebum plugs into a sterile collection chamber, visible immediately to the patient.',
      },
      {
        stepNumber: 4,
        title: 'Antioxidant & Hyaluronic Delivery',
        description: 'Pressurized infusion of concentrated sodium hyaluronate, peptides, and botanical anti-inflammatories to seal the moisture barrier.',
      },
      {
        stepNumber: 5,
        title: 'Clinical Photobiomodulation (LED)',
        description: '10 minutes of medical-grade red (630nm) and blue (415nm) LED therapy to calm vascular erythema and suppress Cutibacterium acnes.',
      },
    ],
    clinicalIndications: ['Comedonal acne', 'Hyperkeratosis', 'Environmental pollution buildup', 'Rough skin texture'],
    contraindications: ['Active open herpes simplex lesions', 'Severe rosacea flare-up', 'Sunburned skin within 48 hours'],
    postCareInstructions: [
      'Avoid direct sun exposure and apply physical SPF 50+ mineral sunscreen daily.',
      'Refrain from AHAs, BHAs, and retinol topicals for 48 hours post-treatment.',
      'Maintain adequate hydration (2.5L+ water daily) to support hyaluronic matrix plumping.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'How is this different from a parlor or salon facial?',
        answer: 'Salon facials rely on abrasive scrubs, manual comedone extractors that cause post-inflammatory hyperpigmentation, and unregulated cosmetic creams. Our Hydra Facial utilizes US-FDA compliant vortex hydro-technology operated by trained clinical therapists with pharmaceutical-grade active serums under dermatological supervision.',
      },
      {
        question: 'Will my face turn red or peel after the session?',
        answer: 'No. You may experience a transient mild pinkish glow for 20 to 30 minutes due to increased micro-circulation. There is zero flaking, peeling, or downtime; patients can resume normal work immediately.',
      },
    ],
  },
  {
    id: 'q-switch-laser',
    slug: 'q-switch-laser',
    title: 'Q-Switch Nd:YAG Laser Melanin Toning',
    subtitle: 'Photo-Acoustic 1064nm & 532nm Nanosecond Targeting for Melasma, Freckles & Tanning',
    category: 'Laser Treatments',
    durationMinutes: 30,
    priceINR: 3500,
    packagePriceINR: 12999,
    packageDescription: 'Course of 4 sessions including post-procedure calming mask protocol',
    downtime: 'Zero Downtime (Transient mild redness for 1-2 hours)',
    recommendedSessions: '4 to 6 sessions at 2 to 3-week intervals for optimal pigment clearance',
    technology: 'Class 4 Q-Switched Neodymium:Yttrium Aluminum Garnet (Nd:YAG) with Top-Hat Beam Profile',
    targetConcerns: ['Melasma (Epidermal & Dermal)', 'Post-inflammatory hyperpigmentation (PIH)', 'Sun lentigines & freckles', 'Persistent tanning'],
    suitableFor: 'Fitzpatrick skin types III to VI common across South Asian skin tones',
    overview:
      'Q-Switch Nd:YAG laser operates in ultra-short nanosecond pulses. Rather than heating tissue thermally (which risks rebound hyperpigmentation in Indian skin), it exerts a photo-acoustic shockwave that mechanically fragments hyperactive melanin clusters into sub-cellular particles. These microscopic fragments are gradually phagocytosed and naturally cleared by macrophages in the lymphatic circulation.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Patch Assessment & Energy Calibration',
        description: 'Evaluation of epidermal melanin index to configure precise fluence (J/cm²) and spot size tailored to the patient’s pigmentation depth.',
      },
      {
        stepNumber: 2,
        title: 'Double Surface Sanitization & Eye Shielding',
        description: 'Placement of OD 7+ protective metal eye shields and skin degreasing with isopropyl medical wipe.',
      },
      {
        stepNumber: 3,
        title: 'Collimated Laser Toning Passes',
        description: 'Systematic cross-hatch passes using 1064nm wavelength at 10Hz frequency delivering uniform photo-acoustic acoustic disruption without bleeding.',
      },
      {
        stepNumber: 4,
        title: 'Post-Laser Cryo-Calming',
        description: 'Application of sterile medical cold compress followed by a concentrated ceramide-tranexamic barrier repair serum.',
      },
    ],
    clinicalIndications: ['Refractory melasma', 'Acanthosis nigricans associated pigmentation', 'Sun freckles', 'Post-burn pigmentation'],
    contraindications: ['Pregnancy', 'Concurrent use of systemic oral isotretinoin', 'History of laser-induced vitiligo/koebnerization'],
    postCareInstructions: [
      'Strict broad-spectrum PA++++ sunscreen application every 3 hours indoors and outdoors.',
      'Do not scrub or rub the treated area with loofahs or rough towels.',
      'Discontinue chemical depilatories and bleaching for 14 days.',
    ],
    leadDoctor: 'Dr. Priya Dharshini (Cosmetologist & Laser Specialist)',
    faqList: [
      {
        question: 'Does Q-Switch laser make Indian skin darker (rebound pigmentation)?',
        answer: 'When performed with low-fluence multi-pass settings and homogeneous top-hat beam profiles under dermatologist supervision, Q-Switch laser is one of the safest protocols for Indian skin. We specifically avoid excessive thermal flaring which is what causes rebound pigmentation in inexperienced hands.',
      },
      {
        question: 'Does the laser procedure hurt?',
        answer: 'Most patients describe the sensation as a rapid, gentle rubber-band snap accompanied by mild warmth. No topical anesthesia is required for standard 1064nm toning.',
      },
    ],
  },
  {
    id: 'laser-hair-reduction',
    slug: 'laser-hair-reduction',
    title: 'Triple-Wavelength Diode Laser Hair Reduction',
    subtitle: '755nm + 808nm + 1064nm Integrated Beam with Continuous Contact Sapphire Cooling (-5°C)',
    category: 'Laser Treatments',
    durationMinutes: 30,
    priceINR: 2999,
    packagePriceINR: 11999,
    packageDescription: 'Course of 6 sessions covering Full Face or targeted body region',
    downtime: 'Zero Downtime',
    recommendedSessions: '6 to 8 sessions spaced 4 to 6 weeks apart following follicular anagen cycles',
    technology: 'Triple Wavelength Diode with Real-Time In-Motion Sapphire Contact Chilling (-5°C)',
    targetConcerns: ['Facial hirsutism (chin, upper lip, jawline)', 'Underarm & bikini hair', 'Folliculitis & ingrown hairs', 'Excessive coarse body hair'],
    suitableFor: 'All Indian skin tones (Fitzpatrick III to V) and hair thicknesses',
    overview:
      'Conventional single-wavelength lasers struggle to address varying hair follicle depths. Our system simultaneously fires 755nm (Alexandrite depth for shallow hair), 808nm (Diode gold standard for median follicles), and 1064nm (Nd:YAG for deep coarse roots) in a single pulse. The integrated sapphire contact cooling head maintains the epidermis at -5°C, ensuring virtually painless delivery while safely targeting the follicular papilla.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Area Mapping & Shaving Prep',
        description: 'Single-use surgical prep blade trims follicles to exactly 1mm above epidermal plane so laser energy concentrates into the root.',
      },
      {
        stepNumber: 2,
        title: 'Cooling Optical Gel Application',
        description: 'Application of hypoallergenic clear optical ultrasound gel to facilitate smooth handpiece glide and optical refractive matching.',
      },
      {
        stepNumber: 3,
        title: 'Dynamic In-Motion Laser Passes',
        description: 'Gliding multi-pass energy delivery (10 pulses per second) gradually heating the dermal follicle bed to thermal coagulation temperature (48°C - 50°C).',
      },
      {
        stepNumber: 4,
        title: 'Aloe & Zinc Soothing Gel',
        description: 'Wipe down of optical gel and application of 99% pure aloe and zinc soothing emulsion.',
      },
    ],
    clinicalIndications: ['Hormonal hirsutism related to PCOS', 'Recurrent pseudofolliculitis barbae', 'Excessive aesthetic body hair'],
    contraindications: ['Waxing, plucking or epilating within 3 weeks prior (root must be present)', 'Active skin infections'],
    postCareInstructions: [
      'Avoid hot showers, steam rooms, and intense cardiovascular exercise for 24 hours.',
      'Do not tweeze or wax between sessions; shaving is permitted if necessary.',
      'Apply physical sunscreen to exposed treated areas.',
    ],
    leadDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
    faqList: [
      {
        question: 'Is laser hair reduction completely permanent?',
        answer: 'Medical lasers achieve 85% to 95% permanent follicle destruction across completed sessions. Fine, sporadic vellus hairs may remain, which require a maintenance session once every 12 to 18 months.',
      },
      {
        question: 'Can I do laser hair reduction if I have PCOS?',
        answer: 'Yes! In fact, it is the first-line dermatological recommendation for PCOS-induced coarse hair. We work alongside your gynecological endocrine treatment for optimal long-term results.',
      },
    ],
  },
  {
    id: 'prp-hair-restoration',
    slug: 'prp-hair-restoration',
    title: 'Autologous High-Yield PRP & Scalp Peptides',
    subtitle: 'Double-Spin Centrifugation (3200 RPM) Delivering 5x Platelet Growth Factors for Follicle Reactivation',
    category: 'Hair & Scalp',
    durationMinutes: 60,
    priceINR: 3200,
    packagePriceINR: 14999,
    packageDescription: 'Course of 6 sessions + baseline trichoscopy & 6-month progress imaging',
    downtime: 'Minimal (Scalp tenderness for 4-6 hours, zero bleeding)',
    recommendedSessions: '6 sessions spaced 3 to 4 weeks apart; maintenance once every 4 months',
    technology: 'Dual-Spin Laboratory Centrifuge with Gel-Separator Vacutainer & Micro-Point Delivery',
    targetConcerns: ['Androgenetic alopecia (Pattern baldness in men & women)', 'Post-COVID or post-illness telogen effluvium', 'Widening central hair parting', 'Diffuse thinning'],
    suitableFor: 'Men and women exhibiting early to moderate follicular miniaturization (Norwood Grade 1 to 4)',
    overview:
      'Platelet-Rich Plasma (PRP) relies on the patient’s own biological healing cascades. A small sample of peripheral blood (15-20ml) is collected and spun in a specialized centrifuge to isolate the buffy coat layer containing 5 to 7 times the baseline concentration of blood platelets. These platelets release high concentrations of PDGF, VEGF, TGF-beta, and IGF-1 directly into the dermal papilla, stimulating angiogenesis and reversing follicular miniaturization.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Venipuncture & Sterile Separation',
        description: 'Drawing 15ml venous blood into sterile ACD-A anticoagulant vacutainers, followed by automated double-speed centrifugation.',
      },
      {
        stepNumber: 2,
        title: 'Scalp Disinfection & Local Desensitization',
        description: 'Scalp cleansing with povidone-iodine and application of medical vibration-assisted topical distraction to eliminate injection discomfort.',
      },
      {
        stepNumber: 3,
        title: 'Subdermal Micro-Injections',
        description: 'Targeted micro-bolus delivery (0.05ml per site) into the sub-galeal follicular layer using 32G ultra-fine diabetic needles at 1cm grid intervals.',
      },
      {
        stepNumber: 4,
        title: 'Scalp Microneedling & Peptide Seal',
        description: 'Superficial 0.5mm microneedling across the balding zone followed by infusion of Copper Tripeptide-1 to amplify follicle anchorage.',
      },
    ],
    clinicalIndications: ['Male & female pattern baldness', 'Traction alopecia', 'Post-febrile diffuse shed', 'Sluggish post-hair transplant graft growth'],
    contraindications: ['Platelet counts below 100,000/uL', 'Active scalp psoriasis or lichen planopilaris', 'Systemic anticoagulant medication'],
    postCareInstructions: [
      'Do not wash hair for 24 hours to allow growth factors full absorption.',
      'Refrain from vigorous exercise, helmet wearing, or heavy sweating for 24 hours.',
      'Resume topical minoxidil or prescribed serums after 48 hours.',
    ],
    leadDoctor: 'Dr. Rajesh Varma (Trichology Fellow)',
    faqList: [
      {
        question: 'When can I expect to see visible hair regrowth from PRP?',
        answer: 'Hair follicle biology operates on a slow 3-month anagen cycle. You will observe reduced daily hair fall by session 2 (Week 6), and measurable thickening and baby hair emergence by session 4 (Week 12-16).',
      },
      {
        question: 'Is PRP painful?',
        answer: 'We use 32-gauge micro-needles (thinner than acupuncture needles) and vibration anesthesia technology. Most patients describe it as mild pinching or scalp pressure rather than pain.',
      },
    ],
  },
  {
    id: 'rf-microneedling',
    slug: 'rf-microneedling',
    title: 'Fractional RF Microneedling & Subcision',
    subtitle: 'Bipolar Radiofrequency Thermal Coagulation at 0.5mm - 3.5mm Depths for Deep Acne Scars',
    category: 'Anti-Aging & Scars',
    durationMinutes: 60,
    priceINR: 3500,
    packagePriceINR: 9999,
    packageDescription: 'Course of 3 sessions including cannula subcision for tethered scar bands',
    downtime: '24 to 48 hours of mild sunburn-like erythema',
    recommendedSessions: '3 to 5 sessions spaced 6 weeks apart to accommodate neocollagenesis',
    technology: 'Gold-Plated Insulated Micro-Needle Array with Real-Time Impedance Monitoring',
    targetConcerns: ['Ice-pick, boxcar & rolling acne scars', 'Large open pores', 'Skin laxity & fine wrinkles', 'Surgical scar remodeling'],
    suitableFor: 'Fitzpatrick skin types I to V, particularly safe for Indian skin due to insulated needle shafts',
    overview:
      'Unlike traditional dermarollers that tear the epidermis on entry and exit, Fractional Radiofrequency delivers insulated 25-pin micro-needles perpendicular to the skin surface. Once the needle tips penetrate into the reticular dermis (up to 3.5mm), they emit a precise pulse of bipolar radiofrequency energy. This induces thermal micro-coagulation zones that initiate wound healing, reorganizing old chaotic scar tissue into orderly collagen and elastin bundles.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Topical Anesthetic Application',
        description: 'Application of medical lidocaine-prilocaine compound cream under occlusion for 45 minutes to ensure total procedural comfort.',
      },
      {
        stepNumber: 2,
        title: 'Blunt Cannula Subcision',
        description: 'Release of deep fibrotic bands tethering rolling scars to subcutaneous fat using an 18G Nokor cannula.',
      },
      {
        stepNumber: 3,
        title: 'Fractional RF Needling Passes',
        description: 'Two to three passes at stepped depths (2.5mm base, 1.5mm mid-dermis, 0.8mm papillary dermis) to reconstruct full dermal thickness.',
      },
      {
        stepNumber: 4,
        title: 'Centrifuged Growth Factor or Hyaluronic Mask',
        description: 'Immediate topical flood of chilled hyaluronic acid and zinc matrix while micro-channels remain open.',
      },
    ],
    clinicalIndications: ['Atrophic post-acne scarring', 'Post-traumatic facial scars', 'Perioral and periorbital fine wrinkling'],
    contraindications: ['Active cystic acne breakouts', 'Implanted cardiac pacemaker', 'Active keloidal tendency'],
    postCareInstructions: [
      'Do not apply makeup for 48 hours.',
      'Cleanse face using only sterile saline or lukewarm water with a gentle prescribed syndet bar.',
      'Wear broad-spectrum SPF 50 sunscreen diligently to prevent transient pigmentation.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'Will RF Microneedling make my acne scars vanish 100%?',
        answer: 'Medical science cannot completely erase scars back to embryonic perfection, but clinical RF microneedling with subcision routinely achieves 60% to 80% visible flattening and textural improvement, making scars barely perceptible in ordinary lighting.',
      },
      {
        question: 'Why are insulated needles safer for Indian skin?',
        answer: 'Insulated needles only emit RF heat at their absolute tip in the deep dermis, completely bypassing the melanin-rich epidermal layer. This virtually eliminates the risk of post-inflammatory hyperpigmentation (PIH) common with non-insulated devices.',
      },
    ],
  },
  {
    id: 'chemical-peel',
    slug: 'chemical-peel',
    title: 'Medical Dermatological Chemical Peels',
    subtitle: 'Customized Sequential Glycolic, Salicylic & Trichloroacetic Formulations for Acne & Glow',
    category: 'Skin Care',
    durationMinutes: 30,
    priceINR: 1999,
    packagePriceINR: 5499,
    packageDescription: 'Course of 3 peeling sessions + post-peel recovery kit',
    downtime: '1 to 3 days of mild micro-flaking (easily managed with moisturizer)',
    recommendedSessions: '3 to 6 sessions spaced 2 to 3 weeks apart',
    technology: 'Pharmaceutical Buffered Single-Agent & Combination Acid Formulations',
    targetConcerns: ['Active inflammatory acne', 'Excessive seborrhea (greasiness)', 'Post-acne blemishes', 'Superficial sun tanning'],
    suitableFor: 'Oily, acne-prone, and sun-damaged skin types',
    overview:
      'Medical chemical peels are controlled resurfacing procedures tailored to exact stratum corneum depths. Using buffered medical acids (Salicylic 20-30%, Glycolic 35-70%, or Lactic-Kojic blends), we dissolve intra-corneocyte desmosomes, accelerating cellular turnover and clearing follicular infundibulum blockages to eliminate active acne and restore radiant skin clarity.',
    stepByStepProtocol: [
      {
        stepNumber: 1,
        title: 'Alcohol-Free Degreasing',
        description: 'Removal of skin sebum mantle with medical prep solution to ensure uniform acid penetration.',
      },
      {
        stepNumber: 2,
        title: 'Sensitive Zone Protection',
        description: 'Application of white petrolatum barrier over delicate zones: corners of eyes, mouth, and nasal alar grooves.',
      },
      {
        stepNumber: 3,
        title: 'Timer-Controlled Acid Application',
        description: 'Precise fan-brush application of therapeutic acid with constant clinical monitoring of erythema and frosting.',
      },
      {
        stepNumber: 4,
        title: 'Sodium Bicarbonate Neutralization',
        description: 'Full neutralization with sterile neutralizing spray to instantly halt acid activity, followed by a chilled calming compress.',
      },
    ],
    clinicalIndications: ['Grade 1 & 2 comedonal and papular acne', 'Epidermal melasma', 'Photodamage', 'Follicular keratosis'],
    contraindications: ['Open excoriations', 'History of hypertrophic scarring', 'Current oral isotretinoin therapy'],
    postCareInstructions: [
      'Never pick, pull or scrub flaking skin; allow it to desquamate naturally.',
      'Apply liberal amounts of prescribed ceramide moisturizer 3 times daily.',
      'Strict sunscreen adherence is mandatory.',
    ],
    leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
    faqList: [
      {
        question: 'Will my face peel off in huge sheets?',
        answer: 'No. Modern clinical peels are formulated with buffered delivery systems that induce microscopic, powder-like flaking rather than dramatic theatrical peeling. It is easily masked with simple moisturizer.',
      },
      {
        question: 'Can I do a chemical peel in the summer?',
        answer: 'Yes, chemical peels are performed year-round in Tamil Nadu when paired with physical broad-spectrum zinc oxide sunscreen and proper post-procedure care.',
      },
    ],
  },
];
