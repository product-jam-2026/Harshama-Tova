'use client';
import UserNavBar from '../../components/UserNavBar'; 


const Home = () => {
  const name = "מיכל";  
  return (
    <div>
        <div>שלום, {name}!</div>
        <UserNavBar />
    </div>
  );
};

export default Home;