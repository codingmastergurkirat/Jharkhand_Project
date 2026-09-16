import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

loadEnvConfig(process.cwd());

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n⚠️  ERROR: Missing Supabase credentials in environment.');
  console.error('Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n');
  process.exit(1);
}

// Service role client bypasses RLS and manages Auth Admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: WebSocket
  }
});

interface SeedAccount {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'citizen' | 'university' | 'industry';
  org_name?: string;
  district?: string;
  domain_tags?: string[];
  facilities?: string;
  expertise?: string;
  interest_type?: string;
  submitter_type?: string;
}

const SEED_ACCOUNTS: SeedAccount[] = [
  // 1. Government Admin
  {
    name: 'Jharkhand State Admin',
    email: 'admin.jharkhand@gov.in',
    password: 'Admin@Jharkhand2026',
    role: 'admin',
    org_name: 'Department of Higher & Technical Education, Govt of Jharkhand',
    district: 'Ranchi',
    domain_tags: ['Public Administration', 'Education', 'Urban Infrastructure']
  },

  // 2. Citizen User
  {
    name: 'Ramesh Kumar',
    email: 'ramesh.citizen@gmail.com',
    password: 'Citizen@2026',
    role: 'citizen',
    district: 'Ranchi',
    submitter_type: 'Citizen'
  },

  // 3. Five Pre-Registered Jharkhand Universities
  {
    name: 'Indian Institute of Technology (ISM) Dhanbad',
    email: 'admin@iitism.ac.in',
    password: 'Univ@IITISM2026',
    role: 'university',
    org_name: 'Indian Institute of Technology (ISM) Dhanbad',
    district: 'Dhanbad',
    domain_tags: ['Environment', 'Energy', 'Urban Infrastructure', 'Water Management'],
    expertise: 'Advanced engineering, earth sciences, geological engineering, mechanical engineering',
    facilities: 'High-tier research labs, technical testing environments'
  },
  {
    name: 'Birla Institute of Technology (BIT) Mesra',
    email: 'admin@bitmesra.ac.in',
    password: 'Univ@BIT2026',
    role: 'university',
    org_name: 'Birla Institute of Technology (BIT) Mesra',
    district: 'Ranchi',
    domain_tags: ['Education', 'Public Administration', 'Accessibility', 'Urban Infrastructure'],
    expertise: 'Computer science, electrical engineering, aerospace engineering, civil engineering',
    facilities: 'Software incubators, advanced computing centers'
  },
  {
    name: 'National Institute of Technology (NIT) Jamshedpur',
    email: 'admin@nitjsr.ac.in',
    password: 'Univ@NIT2026',
    role: 'university',
    org_name: 'National Institute of Technology (NIT) Jamshedpur',
    district: 'East Singhbhum',
    domain_tags: ['Urban Infrastructure', 'Environment', 'Energy'],
    expertise: 'Metallurgical engineering, manufacturing processes, automation',
    facilities: 'Industrial simulation labs, core engineering workshops'
  },
  {
    name: 'Central University of Jharkhand',
    email: 'admin@cuj.ac.in',
    password: 'Univ@CUJ2026',
    role: 'university',
    org_name: 'Central University of Jharkhand',
    district: 'Ranchi',
    domain_tags: ['Rural Livelihoods', 'Environment', 'Agriculture', 'Energy'],
    expertise: 'Interdisciplinary sciences, renewable energy, environmental sustainability',
    facilities: 'Research databases, community-oriented research centers'
  },
  {
    name: 'Usha Martin University',
    email: 'admin@umu.ac.in',
    password: 'Univ@UMU2026',
    role: 'university',
    org_name: 'Usha Martin University',
    district: 'Ranchi',
    domain_tags: ['Education', 'Healthcare', 'Accessibility'],
    expertise: 'Industry-driven engineering courses, computer science, vocational training',
    facilities: 'Modern infrastructure, placement cells, industry-interface labs'
  },

  // 4. Five Pre-Registered Jharkhand Industries (CSR Partners)
  {
    name: 'Tata Steel Limited',
    email: 'csr@tatasteel.com',
    password: 'Ind@Tata2026',
    role: 'industry',
    org_name: 'Tata Steel Limited',
    district: 'East Singhbhum',
    domain_tags: ['Healthcare', 'Education', 'Rural Livelihoods', 'Urban Infrastructure'],
    expertise: 'Heavy steel manufacturing, disaster management, livelihood enhancement',
    interest_type: 'both'
  },
  {
    name: 'Central Coalfields Limited (CCL)',
    email: 'csr@centralcoalfields.in',
    password: 'Ind@CCL2026',
    role: 'industry',
    org_name: 'Central Coalfields Limited (CCL)',
    district: 'Ranchi',
    domain_tags: ['Sanitation', 'Healthcare', 'Energy', 'Environment'],
    expertise: 'Coal mining, public health initiatives, large-scale sanitation installations',
    interest_type: 'funding'
  },
  {
    name: 'Bokaro Steel Plant (SAIL)',
    email: 'csr@sailbokaro.in',
    password: 'Ind@SAIL2026',
    role: 'industry',
    org_name: 'Bokaro Steel Plant (SAIL)',
    district: 'Bokaro',
    domain_tags: ['Urban Infrastructure', 'Energy', 'Water Management'],
    expertise: 'Iron and steel production, heavy industry infrastructure, allied township development',
    interest_type: 'both'
  },
  {
    name: 'Eastern Coalfields Limited (ECL)',
    email: 'csr@easterncoal.gov.in',
    password: 'Ind@ECL2026',
    role: 'industry',
    org_name: 'Eastern Coalfields Limited (ECL)',
    district: 'Dhanbad',
    domain_tags: ['Rural Livelihoods', 'Education', 'Agriculture'],
    expertise: 'Mining operations, extensive rural development projects',
    interest_type: 'funding'
  },
  {
    name: 'Uranium Corporation of India Limited (UCIL)',
    email: 'contact@ucil.gov.in',
    password: 'Ind@UCIL2026',
    role: 'industry',
    org_name: 'Uranium Corporation of India Limited (UCIL)',
    district: 'East Singhbhum',
    domain_tags: ['Environment', 'Energy', 'Healthcare'],
    expertise: 'Nuclear material mining, specialized environmental monitoring',
    interest_type: 'both'
  }
];

async function seed() {
  console.log('================================================================');
  console.log('GOVERNMENT OF JHARKHAND COLLABORATIVE GOVERNANCE PLATFORM');
  console.log('Seeding Demo Accounts & Verifying Profiles');
  console.log('================================================================\n');

  // List existing users to avoid re-creation errors
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list existing auth users:', listError.message);
    process.exit(1);
  }

  const existingByEmail = new Map(userList.users.map((u) => [u.email?.toLowerCase(), u]));

  for (const account of SEED_ACCOUNTS) {
    const emailKey = account.email.toLowerCase();
    const existing = existingByEmail.get(emailKey);

    const userMetadata = {
      name: account.name,
      role: account.role,
      org_name: account.org_name || null,
      district: account.district || null,
      domain_tags: account.domain_tags || [],
      facilities: account.facilities || null,
      expertise: account.expertise || null,
      interest_type: account.interest_type || null,
      submitter_type: account.submitter_type || 'Citizen'
    };

    if (existing) {
      console.log(`[EXISTS] Updating metadata for ${account.name} (${account.email})...`);
      await supabase.auth.admin.updateUserById(existing.id, {
        password: account.password,
        user_metadata: userMetadata,
        email_confirm: true
      });

      // Ensure profile row matches
      await supabase.from('profiles').upsert({
        id: existing.id,
        email: account.email,
        ...userMetadata
      });
    } else {
      console.log(`[CREATING] Generating Auth account for ${account.name} (${account.email})...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: userMetadata
      });

      if (error) {
        console.error(`❌ Failed to create user ${account.email}:`, error.message);
      } else if (data?.user) {
        console.log(`✅ Created ${account.name} [ID: ${data.user.id}]`);
      }
    }
  }

  console.log('\n================================================================');
  console.log('Seeding complete! All 12 demo accounts are active and ready.');
  console.log('================================================================\n');
}

seed().catch((err) => {
  console.error('Unexpected seeding error:', err);
  process.exit(1);
});
