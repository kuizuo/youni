// import { SchemaForm, formFields } from '@/utils/SchemaForm'
// import { useSupabase } from '@/utils/supabase/useSupabase'
import React from 'react'
import { createParam } from 'solito'

const { useParams, useUpdateParams } = createParam<{ email?: string }>()

export function ResetPasswordScreen() {
  return <></>
}
