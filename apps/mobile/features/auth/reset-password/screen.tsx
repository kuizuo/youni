import { Link } from 'solito/link'
import { ChevronLeft } from '@tamagui/lucide-icons'
// import { SchemaForm, formFields } from '@/utils/SchemaForm'
// import { useSupabase } from '@/utils/supabase/useSupabase'
import React, { useEffect } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { createParam } from 'solito'
import { z } from 'zod'

const { useParams, useUpdateParams } = createParam<{ email?: string }>()



export const ResetPasswordScreen = () => {
  return <></>
}
