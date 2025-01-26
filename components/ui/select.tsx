import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return (
    <select {...props} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 ${props.className}`}>
      {children}
    </select>
  );
};

export default Select; 