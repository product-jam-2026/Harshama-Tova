'use client';
import UserNavBar from '../../components/UserNavBar';
import GroupRegistered from '../../components/group-registered';


const Home = () => {
  const name = "מיכל";  
  return (
    <div>
        <div>שלום, {name}!</div>
        <UserNavBar />
        
        <p>הקבוצות שלי:</p>
        <GroupRegistered />

        <p> הסדנאות שלי: </p>

    </div>
  );
};

export default Home;