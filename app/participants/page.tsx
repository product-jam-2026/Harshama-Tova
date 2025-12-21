'use client';
import GroupRegistered from '../../components/group-registered';
import WorkshopRegistered from '../../components/workshop-registered';


const Home = () => {
  const name = "מיכל";  
  return (
    <div>
        <div>שלום, {name}!</div>

        <p>הקבוצות שלי:</p>
        <GroupRegistered />

        <p> הסדנאות שלי: </p>
        <WorkshopRegistered />
        

    </div>
  );
};

export default Home;