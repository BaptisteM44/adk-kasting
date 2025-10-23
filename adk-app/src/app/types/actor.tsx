// // Dans ton fichier .tsx
// interface Actor {
//   id: number
//   display_name: string
//   user_email: string
//   photo_url?: string | null
//   gender?: string | null
//   city?: string | null
//   experience_level?: string | null
// }


// Example type definitions with exports
export type Actor = {
  id: number
  display_name: string
  user_email: string
  first_name: string
  last_name: string
  profilepicture: string | null
  domiciliation: string | null
  user_age: number | null
  total_count: number | null
  birth_date: string | null
  mobile_number: string | null
  city: string | null
  country: string | null
  gender: string | null
  ethnicity: string | null
  build: string | null
  hair_color: string | null
  eye_color: string | null
  experience_level: string | null
  actor_nationality: string | null
  actor_languages_native: string[] | null
  languages: string[] | null
  actor_dance_skills: string[] | null
  actor_music_skills: string[] | null
  actor_driving_license: string | null
  size: number | null
}

export type ActorMinimal = {
  display_name: string
  user_email: string
  first_name: string
  last_name: string
  profilepicture: string | null
  domiciliation: string | null
  user_age: number | null
  total_count: number | null
}