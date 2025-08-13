import React from 'react';
import AuthButton from './AuthButton';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">AI Tutor</h1>
      <nav>
        <AuthButton />
      </nav>
    </header>
  );
};

export default Header;
