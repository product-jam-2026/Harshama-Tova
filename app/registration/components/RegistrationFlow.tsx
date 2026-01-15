'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeRegistration } from '../actions';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';

interface RegistrationFlowProps {
  initialData: any;
}

export default function RegistrationFlow({ initialData }: RegistrationFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State holds all form data
  const [formData, setFormData] = useState({
    firstName: initialData?.first_name || '',
    lastName: initialData?.last_name || '',
    phone: initialData?.phone_number || '',
    city: initialData?.city || '',
    birthDate: initialData?.birth_date ? new Date(initialData.birth_date).toISOString().split('T')[0] : '',
    gender: initialData?.gender || '',
    communityStatus: initialData?.community_status || [],
    comments: initialData?.comments || '',
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const { subscribeToPush } = usePushNotifications();

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const result = await completeRegistration(formData);
    
    if (result.success) {
      try {
        // trying to subscribe the user to push notifications
        // wait for the user to click "Allow" or "Block" in the notification prompt
        await subscribeToPush(); 
      } catch (e) {
        // if the user blocked or closed the prompt, we just log and continue
        console.log('User skipped notifications or failed', e);
      }

      router.push('/participants');
    } else {
      alert('שגיאה בהרשמה: ' + result.error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {step === 1 && <Step1 data={formData} onUpdate={setFormData} onNext={nextStep} />}
      {step === 2 && <Step2 data={formData} onUpdate={setFormData} onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <Step3 data={formData} onUpdate={setFormData} onSubmit={handleFinalSubmit} onBack={prevStep} isSubmitting={isSubmitting}/>}      
    </div>
  );
}