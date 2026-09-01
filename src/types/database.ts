export interface Country {
  id: string
  name: string
  flag_emoji: string
  points: number
  rating: string
  created_at: string
}

export interface Agreement {
  id: string
  title: string
  body: string
  impact: string
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

