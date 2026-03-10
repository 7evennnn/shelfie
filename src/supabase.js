import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hngqmdbbzhoobbzjpkbh.supabase.co'
const supabaseKey = 'sb_publishable_HAhVZgh2yU_SgnjNT-32sw_nttBnsxN'

export const supabase = createClient(supabaseUrl, supabaseKey)
