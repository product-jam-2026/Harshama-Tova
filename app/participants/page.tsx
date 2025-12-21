'use client';
import GroupRegistered from '../../components/group-registered';
import WorkshopRegistered from '../../components/workshop-registered';

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