// Re-export supabase client from lib/supabase.js
import { supabase } from '../../lib/supabase.js'

export const createClient = () => {
  return supabase
}

export default createClient 