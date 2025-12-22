'use client';
import GroupRegistered from '@/app/participants/components/group-registered-card';
import WorkshopRegistered from '@/app/participants/components/workshop-registered-card';

const Home = () => {
  const name = "מיכל";  
  return (
    <div>
        <p>שלום, {name}!</p>
        
        <p>הקבוצות שלי:</p>
        <GroupRegistered />

        <p> הסדנאות שלי: </p>
        <WorkshopRegistered />
        

    </div>
  );
};

export default Home;