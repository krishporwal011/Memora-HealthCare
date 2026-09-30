export interface OnboardingStrings {
  title: string;
  stepSignIn: string;
  stepProfile: string;
  stepConsent: string;
  stepGuardian: string;
  stepMemories: string;
  stepCalibration: string;
  lawyerPending: string;
  consentBody: string;
  capacityQuestion: string;
  capacityExplanation: string;
  guardianDeclaration: string;
  relationshipPlaceholder: string;
  notePlaceholder: string;
  firstMemoryTitle: string;
  memoryCaption: string;
  memoryCaptionPlaceholder: string;
  calibrationTitle: string;
  calibrationDesc: string;
  startCalibrationBtn: string;
  continueBtn: string;
  backBtn: string;
  elderNameLabel: string;
  caregiverNameLabel: string;
  caregiverPhoneLabel: string;
}

export const ONBOARDING_STRINGS: Record<string, OnboardingStrings> = {
  en: {
    title: "Caregiver Onboarding & Guardian Consent",
    stepSignIn: "Caregiver Sign-In",
    stepProfile: "Caregiver Profile",
    stepConsent: "Plain-Language Consent",
    stepGuardian: "Guardian & Capacity",
    stepMemories: "First Memories",
    stepCalibration: "Calibration Hand-Off",
    lawyerPending: "Lawyer review pending",
    consentBody:
      "Memora provides gentle cognitive stimulation, family reminiscence, and calm daily activities. It is NOT a diagnostic tool, disease staging system, or medical device. In accordance with India's DPDP Act 2023, data is encrypted and stored in the India region (Mumbai). You retain full rights to inspect, export, or permanently erase all patient data at any time.",
    capacityQuestion:
      "Does the elder lack legal or independent digital capacity to provide digital consent?",
    capacityExplanation:
      "Under DPDP Act 2023 and RPwD Act 2016, verifiable consent from a designated family caregiver or lawful guardian is required.",
    guardianDeclaration:
      "I declare that I am the lawful guardian or primary family caregiver managing daily care and decisions for this elder.",
    relationshipPlaceholder: "Relationship (e.g., Daughter, Son, Spouse, Caregiver)",
    notePlaceholder: "Guardian note (e.g., Primary caregiver living in same home in Guwahati)",
    firstMemoryTitle: "Add a Cherished Memory",
    memoryCaption: "Memory Title / Story Prompt",
    memoryCaptionPlaceholder: "e.g., Rongali Bihu harvest celebration at ancestral home (1985)",
    calibrationTitle: "Initial Activity Calibration",
    calibrationDesc:
      "The first 5-10 minute session will establish the elder's personal baseline. The adaptive engine starts at neutral difficulty (θ = 0.0) with gentle learning rates. We suggest sitting comfortably together.",
    startCalibrationBtn: "Start Calibration Activity with Elder",
    continueBtn: "Next Step",
    backBtn: "Previous",
    elderNameLabel: "Elder's Full Name",
    caregiverNameLabel: "Your Full Name (Caregiver / Guardian)",
    caregiverPhoneLabel: "Phone Number",
  },
  hi: {
    title: "देखभालकर्ता पंजीकरण और अभिभावक सहमति",
    stepSignIn: "देखभालकर्ता साइन-इन",
    stepProfile: "देखभालकर्ता प्रोफ़ाइल",
    stepConsent: "सरल भाषा में सहमति",
    stepGuardian: "अभिभावक और क्षमता",
    stepMemories: "पहली यादें",
    stepCalibration: "कैलिब्रेशन शुरुआत",
    lawyerPending: "वकील समीक्षा लंबित",
    consentBody:
      "मेमोरा सौम्य स्मृति प्रोत्साहन, पारिवारिक यादें और शांत दैनिक गतिविधियां प्रदान करता है। यह कोई नैदानिक उपकरण, बीमारी का चरण तय करने वाला साधन या चिकित्सा उपकरण नहीं है। भारत के डीपीडीपी अधिनियम 2023 के तहत डेटा मुंबई क्षेत्र में सुरक्षित संग्रहीत है। आप किसी भी समय डेटा मिटाने का अनुरोध कर सकते हैं।",
    capacityQuestion: "क्या बुजुर्ग स्वतंत्र डिजिटल सहमति देने में असमर्थ हैं?",
    capacityExplanation:
      "डीपीडीपी अधिनियम 2023 के अनुसार, परिजनों या अभिभावक द्वारा सत्यापन योग्य सहमति आवश्यक है।",
    guardianDeclaration:
      "मैं घोषणा करता/करती हूँ कि मैं इस बुजुर्ग के लिए प्राथमिक पारिवारिक देखभालकर्ता या कानूनी अभिभावक हूँ।",
    relationshipPlaceholder: "संबंध (जैसे बेटी, बेटा, जीवनसाथी)",
    notePlaceholder: "अभिभावक विवरण (जैसे साथ रहने वाले प्राथमिक देखभालकर्ता)",
    firstMemoryTitle: "एक प्रिय स्मृति जोड़ें",
    memoryCaption: "स्मृति शीर्षक या कहानी",
    memoryCaptionPlaceholder: "जैसे 1985 का पारिवारिक उत्सव",
    calibrationTitle: "प्रारंभिक गतिविधि कैलिब्रेशन",
    calibrationDesc:
      "पहला 5-10 मिनट का सत्र बुजुर्ग के लिए अनुकूल स्तर तय करेगा। आप साथ बैठकर पहली गतिविधि में उनका साथ दे सकते हैं।",
    startCalibrationBtn: "बुजुर्ग के साथ गतिविधि शुरू करें",
    continueBtn: "आगे बढ़ें",
    backBtn: "पीछे जाएं",
    elderNameLabel: "बुजुर्ग का पूरा नाम",
    caregiverNameLabel: "आपका पूरा नाम (अभिभावक)",
    caregiverPhoneLabel: "फ़ोन नंबर",
  },
  as: {
    title: "শুশ্ৰূষাকাৰী পঞ্জীয়ন আৰু অভিভাৱকৰ সন্মতি",
    stepSignIn: "শুশ্ৰূষাকাৰীৰ ছাইন-ইন",
    stepProfile: "শুশ্ৰূষাকাৰীৰ পৰিচয়",
    stepConsent: "সহজ ভাষাৰ সন্মতি",
    stepGuardian: "অভিভাৱক আৰু ক্ষমতা",
    stepMemories: "প্ৰথম সোঁৱৰণি",
    stepCalibration: "কেলিব্ৰেচন আৰম্ভণি",
    lawyerPending: "আইনজীৱীৰ পৰ্যালোচনা বাকী আছে",
    consentBody:
      "মেমোৰাই মৃদু স্মৃতি উদ্দীপনা, পাৰিবাৰিক সোঁৱৰণি আৰু শান্ত দৈনন্দিন কাৰ্যকলাপ প্ৰদান কৰে। ই কোনো ৰোগ নিৰ্ণয়কাৰী সঁজুলি বা চিকিৎসা সামগ্ৰী নহয়। ডিপিডিপি আইন ২০২৩ অনুসৰি তথ্য ভাৰতত সুৰক্ষিতভাৱে ৰখা হয়। আপুনি যিকোনো সময়তে সকলো তথ্য মচি পেলোৱাৰ অনুৰোধ জনাব পাৰে।",
    capacityQuestion: "জ্যেষ্ঠ ব্যক্তিজন স্বতন্ত্ৰভাৱে ডিজিটেল সন্মতি দিবলৈ অপাৰগনে?",
    capacityExplanation:
      "ডিপিডিপি আইন ২০২৩ আৰু আৰপিডব্লিউডি আইন ২০১৬ অনুসৰি, প্ৰাথমিক শুশ্ৰূষাকাৰী বা আইনী অভিভাৱকৰ সন্মতি অপৰিহাৰ্য।",
    guardianDeclaration:
      "মই ঘোষণা কৰোঁ যে মই এই জ্যেষ্ঠ ব্যক্তিজনৰ প্ৰাথমিক পৰিয়াল শুশ্ৰূষাকাৰী বা আইনী অভিভাৱক।",
    relationshipPlaceholder: "সম্পৰ্ক (যেনে জীয়াৰী, পুত্ৰ, পত্নী/স্বামী)",
    notePlaceholder: "অভিভাৱকৰ টোকা (যেনে গুৱাহাটীত একেলগে থকা প্ৰাথমিক শুশ্ৰূষাকাৰী)",
    firstMemoryTitle: "এটি মৰমৰ সোঁৱৰণি যোগ কৰক",
    memoryCaption: "সোঁৱৰণিৰ নাম বা কাহিনী",
    memoryCaptionPlaceholder: "যেনে পৈতৃক ঘৰৰ ৰঙালী বিহু উদযাপন (১৯৮৫)",
    calibrationTitle: "কাৰ্যকলাপৰ প্ৰাৰম্ভিক কেলিব্ৰেচন",
    calibrationDesc:
      "প্ৰথম ৫-১০ মিনিটৰ অধিবেশনে জ্যেষ্ঠজনৰ সুবিধা অনুসৰি সঠিক মাত্ৰা বাছনি কৰিব। আপুনি তেওঁলোকৰ কাষত বহি সহায় কৰিব পাৰে।",
    startCalibrationBtn: "জ্যেষ্ঠজনৰ সৈতে খেল আৰম্ভ কৰক",
    continueBtn: "আগলৈ যাওক",
    backBtn: "পিছলৈ যাওক",
    elderNameLabel: "জ্যেষ্ঠজনৰ সম্পূৰ্ণ নাম",
    caregiverNameLabel: "আপোনাৰ সম্পূৰ্ণ নাম (অভিভাৱক)",
    caregiverPhoneLabel: "ফোন নম্বৰ",
  },
};
