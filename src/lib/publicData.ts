import clinicService from '@/lib/clinicService';
import { TREATMENTS_DATA, TreatmentItem } from '@/data/treatmentsData';

export interface PublicBranch {
  code: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  city: string;
  doctor: string;
  image: string;
  isMain?: boolean;
}

export interface PublicDoctor {
  name: string;
  qualification: string;
  regNo: string;
  experience: string;
  role: string;
  location: string;
  focus: string;
  initials: string;
  image: string;
  bio?: string;
  focusAreas?: string[];
  assignedStoreCode?: string;
}

export interface PublicStats {
  branchCount: number;
  doctorCount: number;
  treatmentCount: number;
  patientCount: string;
}

// Fallback branches in case database is offline
const FALLBACK_BRANCHES: PublicBranch[] = [
  {
    code: 'NILA-TH',
    name: 'Theni (Main Branch)',
    address: '42, Theni Main Road, Theni, Tamil Nadu - 625531',
    phone: '+91 98450 11223',
    hours: '9:00 AM - 8:00 PM',
    city: 'Theni',
    doctor: 'Dr. Anitha Ramachandran',
    image: '/images/clinic/reception.jpg',
    isMain: true,
  },
];

// Rich core doctor profiles for editorial presentation
const CORE_DOCTOR_PROFILES: Record<string, Partial<PublicDoctor>> = {
  'dr. anitha ramachandran': {
    name: 'Dr. Anitha Ramachandran',
    qualification: 'MBBS, MD - Dermatology, Venereology & Leprosy (Madras Medical College)',
    regNo: 'TNMC Reg #89234',
    experience: '12+ Years Clinical Practice',
    role: 'Chief Dermatologist · Skin Specialist',
    location: 'Theni (Main Branch)',
    focus: 'Acne Scars, Pigmentation & Medical Peels',
    initials: 'AR',
    image: '/images/doctors/dr-anitha.jpg',
    bio: 'Specialist in acne scar subcision, hyperpigmentation, melasma protocols, and medical chemical peels for South Asian phototypes.',
    focusAreas: ['Acne Scar Subcision', 'Melasma & Pigmentation', 'Sequential Peels', 'General Dermatology'],
    assignedStoreCode: 'NILA-TH',
  },
  'dr. rajesh varma': {
    name: 'Dr. Rajesh Varma',
    qualification: 'MBBS, Fellowship in Trichology & Hair Restoration (UK)',
    regNo: 'TNMC Reg #94112',
    experience: '9+ Years Follicular Medicine',
    role: 'Lead Trichologist · Hair Specialist',
    location: 'Madurai City Outlet',
    focus: 'Autologous PRP Therapy & Hair Fall Reversal',
    initials: 'RV',
    image: '/images/doctors/dr-rajesh.jpg',
    bio: 'Dedicated to follicular preservation and platelet biology. Spearheaded our high-yield 3200 RPM double-spin PRP protocol for pattern hair loss.',
    focusAreas: ['Androgenetic Alopecia', 'Autologous PRP', 'Digital Trichoscopy', 'Scalp Peptides'],
    assignedStoreCode: 'NILA-MD',
  },
  'dr. priya dharshini': {
    name: 'Dr. Priya Dharshini',
    qualification: 'MBBS, DVD, Fellowship in Aesthetic Lasers (ESCAD Europe)',
    regNo: 'TNMC Reg #103421',
    experience: '8+ Years Laser Physics',
    role: 'Head of Laser Surgery · Skin & Hair',
    location: 'Chennai Laser Hub',
    focus: 'Laser Skin Toning & Diode Hair Reduction',
    initials: 'PD',
    image: '/images/doctors/dr-priya.jpg',
    bio: 'Specialist in optical laser interactions with Indian skin. Calibrates our Class 4 Q-Switch and Diode lasers for safe clearance without burns.',
    focusAreas: ['Q-Switch Laser Toning', 'Diode Laser Hair Reduction', 'Post-Acne Blemishes'],
    assignedStoreCode: 'NILA-CH',
  },
};

/**
 * Format raw store name from DB into clean, user-friendly branch title
 */
function cleanStoreName(rawName: string, code: string): string {
  let cleaned = (rawName || '').replace(/^Nila\s*Clinic\s*[-–:]*\s*/i, '').trim();
  if (!cleaned) return code;
  if (cleaned.toLowerCase() === 'puducherry') return 'Puducherry Hub';
  if (cleaned.toLowerCase() === 'porur') return 'Porur Laser Center';
  return cleaned;
}

/**
 * Extract clean city name from address or store name
 */
function extractCity(address: string, name: string): string {
  const combined = `${name} ${address}`.toLowerCase();
  if (combined.includes('theni')) return 'Theni';
  if (combined.includes('madurai')) return 'Madurai';
  if (combined.includes('chennai') || combined.includes('porur')) return 'Chennai';
  if (combined.includes('coimbatore')) return 'Coimbatore';
  if (combined.includes('trichy') || combined.includes('tiruchirappalli')) return 'Trichy';
  if (combined.includes('puducherry') || combined.includes('pondicherry')) return 'Puducherry';
  return name.split(' ')[0] || 'Tamil Nadu';
}

/**
 * Dynamically fetches and normalizes all active clinic branches from MongoDB.
 */
export async function getPublicClinicBranches(): Promise<PublicBranch[]> {
  try {
    const dbStores = await clinicService.getStores();
    if (!dbStores || dbStores.length === 0) {
      return FALLBACK_BRANCHES;
    }

    // Also get active doctors to associate them with branches
    const users = await clinicService.getUsers();
    const docUsers = users.filter((u) => u.role === 'doctor' && u.isActive !== false);

    const branches: PublicBranch[] = dbStores.map((store) => {
      const code = store.code.toUpperCase();
      const cleanedName = cleanStoreName(store.name, code);
      const city = extractCity(store.address || '', store.name || '');

      // Working hours formatting
      let hours = '9:00 AM - 8:00 PM';
      if (store.workingHours?.open && store.workingHours?.close) {
        hours = `${store.workingHours.open} - ${store.workingHours.close}`;
      }

      // Find doctor assigned to this store
      const assignedDoc = docUsers.find(
        (doc) =>
          doc.assignedStoreIds?.includes(code) ||
          doc.primaryStoreId === code ||
          doc.assignedStoreIds?.includes('ALL')
      );

      // Default doctor mapping if not explicitly assigned
      let doctorName = assignedDoc?.name || 'Dr. Anitha Ramachandran';
      if (code.includes('MD')) doctorName = 'Dr. Rajesh Varma';
      else if (code.includes('CH') || code.includes('PORUR')) doctorName = 'Dr. Priya Dharshini';
      else if (code.includes('CB')) doctorName = 'Dr. R. Kavitha';
      else if (code.includes('TR')) doctorName = 'Dr. S. Karthik';

      // Pick representative facility image
      let image = '/images/clinic/reception.jpg';
      if (code.includes('CH') || code.includes('PORUR')) image = '/images/clinic/laser-suite.jpg';
      else if (code.includes('MD') || code.includes('TR')) image = '/images/clinic/consultation.jpg';

      return {
        code,
        name: cleanedName,
        address: store.address || `${cleanedName}, Tamil Nadu`,
        phone: store.phone || '+91 98450 11223',
        hours,
        city,
        doctor: doctorName,
        image,
        isMain: code === 'NILA-TH',
      };
    });

    return branches;
  } catch (err) {
    console.warn('[getPublicClinicBranches] Failed to fetch live stores, using fallback:', err);
    return FALLBACK_BRANCHES;
  }
}

/**
 * Dynamically fetches and merges doctors from database and editorial profiles.
 */
export async function getPublicDoctors(): Promise<PublicDoctor[]> {
  try {
    const users = await clinicService.getUsers();
    const staff = await clinicService.getStaff();
    const branches = await getPublicClinicBranches();

    // Identify all inactive doctor names to strictly exclude (BUG-06)
    const inactiveDoctorNames = new Set<string>();
    users.filter(u => u.role === 'doctor' && u.isActive === false).forEach(u => {
      if (u.name) inactiveDoctorNames.add(u.name.toLowerCase().trim());
    });
    staff.filter(s => (s.designation === 'Doctor' || s.loginRole === 'Doctor') && s.isActive === false).forEach(s => {
      if (s.name) inactiveDoctorNames.add(s.name.toLowerCase().trim());
    });

    const docUsers = users.filter((u) => u.role === 'doctor' && u.isActive !== false && !inactiveDoctorNames.has((u.name || '').toLowerCase().trim()));
    const docStaff = staff.filter((s) => (s.designation === 'Doctor' || s.loginRole === 'Doctor') && s.isActive !== false && !inactiveDoctorNames.has((s.name || '').toLowerCase().trim()));

    // Map all DB doctors
    const doctorsMap = new Map<string, PublicDoctor>();

    // 1. First add core profiles that are NOT inactive
    Object.values(CORE_DOCTOR_PROFILES).forEach((profile) => {
      if (profile.name) {
        const key = profile.name.toLowerCase().trim();
        if (!inactiveDoctorNames.has(key)) {
          doctorsMap.set(key, profile as PublicDoctor);
        }
      }
    });

    // 2. Enrich or insert from DB Users
    docUsers.forEach((docUser) => {
      const key = (docUser.name || '').toLowerCase().trim();
      if (inactiveDoctorNames.has(key)) return;
      const existing = doctorsMap.get(key);

      // Resolve store location
      const storeCode = docUser.primaryStoreId || docUser.assignedStoreIds?.[0] || 'NILA-TH';
      const matchedBranch = branches.find((b) => b.code === storeCode);
      const branchName = matchedBranch ? matchedBranch.name : 'Nila Clinic';

      if (existing) {
        // Update live store location if assigned
        existing.location = branchName;
        existing.assignedStoreCode = storeCode;
        if (docUser.image) {
          existing.image = docUser.image;
        }
        if ((docUser as any).qualification) existing.qualification = (docUser as any).qualification;
        if ((docUser as any).experience) existing.experience = (docUser as any).experience;
        if ((docUser as any).regNo) existing.regNo = (docUser as any).regNo;
        if ((docUser as any).focus) existing.focus = (docUser as any).focus;
        if (docUser.specialization) existing.role = `${docUser.specialization} · Specialist`;
        doctorsMap.set(key, existing);
      } else {
        // Brand new doctor added via Admin panel
        const initials = docUser.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'DR';

        doctorsMap.set(key, {
          name: docUser.name,
          qualification: (docUser as any).qualification || 'MBBS, MD - Dermatology & Aesthetic Medicine',
          regNo: (docUser as any).regNo || 'TNMC Reg #Registered',
          experience: (docUser as any).experience || '8+ Years Clinical Experience',
          role: docUser.specialization ? `${docUser.specialization} · Specialist` : 'Attending Dermatologist & Skin Specialist',
          location: branchName,
          focus: (docUser as any).focus || 'Clinical Skin Care, Acne & Laser Protocols',
          initials,
          image: docUser.image || '/images/doctors/dr-anitha.jpg',
          bio: `${docUser.name} specializes in advanced dermatological care and trichology treatments across Nila Clinic centers.`,
          focusAreas: ['Skin Evaluation', 'Laser Care', 'Hair Protocols'],
          assignedStoreCode: storeCode,
        });
      }
    });

    // 3. Also enrich or insert from DB Staff
    docStaff.forEach((st) => {
      const key = (st.name || '').toLowerCase().trim();
      if (!doctorsMap.has(key) && !inactiveDoctorNames.has(key)) {
        const storeCode = st.stores?.[0] || 'NILA-TH';
        const matchedBranch = branches.find((b) => b.code === storeCode);
        const branchName = matchedBranch ? matchedBranch.name : 'Nila Clinic';
        doctorsMap.set(key, {
          name: st.name,
          qualification: 'MBBS, MD - Dermatology & Aesthetic Medicine',
          regNo: 'TNMC Reg #Registered',
          experience: '8+ Years Clinical Experience',
          role: 'Attending Specialist & Doctor',
          location: branchName,
          focus: 'Clinical Skin Care, Acne & Laser Protocols',
          initials: st.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'DR',
          image: st.image || '/images/doctors/dr-anitha.jpg',
          bio: `${st.name} specializes in advanced clinical treatments at Nila Clinic.`,
          focusAreas: ['Skin Evaluation', 'Laser Care', 'Hair Protocols'],
          assignedStoreCode: storeCode,
        });
      }
    });

    return Array.from(doctorsMap.values()).filter((d) => !inactiveDoctorNames.has(d.name.toLowerCase().trim()));
  } catch (err) {
    console.warn('[getPublicDoctors] Failed to fetch live doctors, using core profiles:', err);
    return Object.values(CORE_DOCTOR_PROFILES) as PublicDoctor[];
  }
}

/**
 * Dynamically fetches services from MongoDB and merges with rich treatment specifications.
 */
export async function getPublicTreatments(): Promise<TreatmentItem[]> {
  try {
    const dbServices = await clinicService.getServices();
    if (!dbServices || dbServices.length === 0) {
      return TREATMENTS_DATA;
    }

    // Create a clone of the rich editorial treatments
    const treatments: TreatmentItem[] = [...TREATMENTS_DATA];

    // 1. Update prices & durations for matching treatments from DB
    dbServices.forEach((service) => {
      const serviceNameLower = (service.name || '').toLowerCase().trim();
      const matchedTreatment = treatments.find((t) => {
        const titleLower = t.title.toLowerCase();
        return (
          titleLower.includes(serviceNameLower) ||
          serviceNameLower.includes(t.title.toLowerCase().split(' ')[0])
        );
      });

      if (matchedTreatment) {
        if (typeof service.price === 'number' && service.price > 0) {
          matchedTreatment.priceINR = service.price;
        }
        if (typeof service.duration === 'number' && service.duration > 0) {
          matchedTreatment.durationMinutes = service.duration;
        }
        if (service.description && service.description.length > 20) {
          matchedTreatment.subtitle = service.description;
        }
        if (service.image) {
          matchedTreatment.image = service.image;
        }
        if (service.isFavorite) {
          (matchedTreatment as any).isFavorite = true;
        }
      } else if (service.isActive !== false) {
        // 2. If DB has an active service not in TREATMENTS_DATA, add it dynamically!
        const slug = (service.name || 'treatment')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const isHair =
          (service.category || '').toLowerCase().includes('hair') ||
          (service.name || '').toLowerCase().includes('hair') ||
          (service.name || '').toLowerCase().includes('prp');

        // Select suitable clinical image (prefer uploaded service image)
        let image = service.image || '/images/treatments/hydra-facial.jpg';
        if (!service.image) {
          if (isHair) image = '/images/treatments/prp-hair-restoration.jpg';
          else if (serviceNameLower.includes('laser')) image = '/images/treatments/q-switch-laser.jpg';
          else if (serviceNameLower.includes('peel')) image = '/images/treatments/chemical-peel.jpg';
          else if (serviceNameLower.includes('rf') || serviceNameLower.includes('scar'))
            image = '/images/treatments/rf-microneedling.jpg';
        }

        const concerns = (service as any).concerns
          ? String((service as any).concerns)
              .split(';')
              .map((c) => c.trim())
              .filter(Boolean)
          : ['Clinical Dermatology', 'Targeted Rejuvenation'];

        const item: any = {
          id: slug,
          slug,
          title: service.name,
          subtitle: service.description || 'Doctor-supervised specialized dermatological treatment.',
          image,
          category: isHair ? 'Hair Treatments' : 'Skin Treatments',
          durationMinutes: service.duration || 30,
          priceINR: service.price || 1999,
          downtime: 'Zero to Minimal Downtime',
          recommendedSessions: '1 - 3 sessions based on clinical diagnosis',
          technology: 'US-FDA Cleared Medical Systems',
          targetConcerns: concerns,
          suitableFor: 'All Indian skin phototypes (III-VI)',
          isFavorite: Boolean(service.isFavorite),
          overview:
            service.description ||
            `Clinical protocol for ${service.name} administered exclusively by qualified dermatologists.`,
          stepByStepProtocol: [
            {
              stepNumber: 1,
              title: 'Diagnostic Assessment',
              description: "Doctor Wood's lamp or trichoscopy evaluation before initiation.",
            },
            {
              stepNumber: 2,
              title: 'Clinical Procedure',
              description: `Standardized ${service.name} protocol following strict medical sterilizations.`,
            },
            {
              stepNumber: 3,
              title: 'Post-Care & Review',
              description: 'Calming serum application and personalized aftercare instructions.',
            },
          ],
          clinicalIndications: concerns,
          contraindications: ['Active skin infection', 'Uncontrolled eczema/psoriasis'],
          postCareInstructions: ['Apply broad-spectrum sunscreen SPF 50+', 'Avoid direct heat for 24 hours'],
          leadDoctor: 'Dr. Anitha Ramachandran',
          faqList: [
            {
              question: `Is ${service.name} safe?`,
              answer: 'Yes, all procedures are conducted under sterile conditions by qualified medical specialists.',
            },
          ],
        };

        treatments.push(item);
      }
    });

    // Sort to place favorites first if marked
    treatments.sort((a: any, b: any) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

    return treatments;
  } catch (err) {
    console.warn('[getPublicTreatments] Failed to fetch live services, using TREATMENTS_DATA:', err);
    return TREATMENTS_DATA;
  }
}

/**
 * Returns key live public stats
 */
export async function getPublicSiteStats(): Promise<PublicStats> {
  const [branches, doctors, treatments] = await Promise.all([
    getPublicClinicBranches(),
    getPublicDoctors(),
    getPublicTreatments(),
  ]);

  return {
    branchCount: branches.length,
    doctorCount: doctors.length,
    treatmentCount: treatments.length,
    patientCount: '10,000+',
  };
}

