export interface Country {
  id: string
  name: string
  flag_emoji: string
  points: number
  created_at: string
}

export interface Agreement {
  id: string
  title: string
  body: string
  created_at: string
}

export interface AgreementCountry {
  agreement_id: string
  country_id: string
}

// Derived type: agreement with its participating countries
export interface AgreementWithCountries extends Agreement {
  countries: Country[]
}

// Derived type: country with its agreement count
export interface CountryWithAgreements extends Country {
  agreement_count: number
}

// Supabase Database type (for type safety)
export interface Database {
  public: {
    Tables: {
      countries: {
        Row: Country
        Insert: Omit<Country, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Country, 'id' | 'created_at'>>
      }
      agreements: {
        Row: Agreement
        Insert: Omit<Agreement, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Agreement, 'id' | 'created_at'>>
      }
      agreement_countries: {
        Row: AgreementCountry
        Insert: AgreementCountry
        Update: Partial<AgreementCountry>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
