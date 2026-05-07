export enum UserRole {
  KADER = 'kader',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

export interface UserProfile {
  uid: string;
  name: string;
  idNumber: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  posyanduName?: string;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  nik?: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  
  // Birth details
  birthWeight?: number;
  birthHeight?: number;
  
  // Parents details
  fatherName?: string;
  fatherNik?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherNik?: string;
  motherBirthDate?: string;
  motherOccupation?: string;
  
  // KB History
  kbHistory?: string;
  kbReason?: string;

  posyanduName: string;
  address: string;
  createdAt: string;

  // Legacy field for compatibility
  parentsName: string; 
}

export interface Measurement {
  id: string;
  childId: string;
  date: string;
  weight: number;
  height: number;
  headCircumference?: number;
  armCircumference?: number; // LILA
  stuntingStatus?: 'Normal' | 'Stunting' | 'Risiko Stunting';
  
  // Health & Nutrition
  exclusiveBreastfeeding?: boolean;
  completeImmunization?: boolean;
  caredBy?: string;
  routineToPosyandu?: boolean;
  presentBKB?: boolean;
  stillBreastfeeding?: boolean;
  proteinAnimal3x?: boolean;
  
  // Development
  kkaFilled?: boolean;
  kkaGraphAppropriate?: boolean;
  
  // History & Environment
  congenitalDisease?: string;
  infectiousDiseaseHistory?: string;
  exposedToSmoke?: boolean;
  healthyLatrine?: boolean;
  cleanWaterSource?: boolean;
  referredToHospital?: boolean;
  hasBpjs?: boolean;

  kaderId: string;
  notes?: string;
}
