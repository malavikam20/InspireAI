"use client"
import React, { useContext, useState } from 'react'
import FormSection from '../_components/FormSection'
import OutputSection from '../_components/OutputSection'
import Templates from '@/app/(data)/Templates'
import { TEMPLATE } from '../../_components/TemplateListSection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { chatSession } from '@/utils/AiModel'
import { AIOutput } from '@/utils/schema'
import { db } from '@/utils/db'
import { useUser } from '@clerk/nextjs'

import moment from 'moment'
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { useRouter } from 'next/navigation'
import { UserSubscriptionContext } from '@/app/(context)/UserSubscriptionContext'
import { UpdateCreditUsageContext } from '@/app/(context)/UpdateCreditUsageContext'

interface PROPS {
    params:{
        'template-slug':string
    }
}

function CreateNewContent(props:PROPS) {

    const selectedTemplate:TEMPLATE|undefined =Templates?.find((item)=>item.slug==props.params['template-slug']);
    const [loading,setLoading]=useState(false);
    const [aiOutput,setAiOutput]=useState<string>('');
    const {user}=useUser();
    const router=useRouter();
    const {totalUsage,setTotalUsage}=useContext(TotalUsageContext);
    const {userSubscription,setUserSubscription}=useContext(UserSubscriptionContext);
    const {updateCreditUsage, setUpdateCreditUsage}=useContext(UpdateCreditUsageContext);
    
    const GenerateAIContent=async (formData:any)=>{
        if(totalUsage>=1000&&!userSubscription)
        {
          console.log('Usage Limit Exceeded, Please Upgrade your Subscription.');
          router.push('/dashboard/billing');
          return;
        }
      setLoading(true);
        const SelectedPrompt=selectedTemplate?.aiPrompt;
        const FinalAIPrompt=JSON.stringify(formData)+", "+ SelectedPrompt;
        const result=await chatSession.sendMessage(FinalAIPrompt);
        
        setAiOutput(result?.response.text());
        await SaveInDb(JSON.stringify(formData), selectedTemplate?.slug, result?.response.text())
        setLoading(false);

        setUpdateCreditUsage(Date.now());
    }

    const SaveInDb=async(formData:any, slug:any, aiResp:string)=>{
      const result=await db.insert(AIOutput).values({
        formData:formData,
        templateSlug:slug,
        aiResponse:aiResp,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD/MM/YYYY'),
      });
      
      console.log(result);
    }

  return (
    <div className='p-5'>
        <Link href={"/dashboard"}>
            <Button> <ArrowLeft/> Back </Button>
        </Link>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 py-5'>
      {/*FormSection */}
        <FormSection 
        selectedTemplate={selectedTemplate}
        userFormInput={(v:any)=>GenerateAIContent(v)}
        loading={loading}/>
      {/*OutputSection*/}
      <div className='col-span-2'>
        <OutputSection  aiOutput={aiOutput}/>
      </div>
    </div>
    </div>
  )
}

export default CreateNewContent
