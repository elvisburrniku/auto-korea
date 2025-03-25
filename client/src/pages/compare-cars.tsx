import React from 'react';
import CarComparison from '@/components/car-comparison';

export default function CompareCarsPage() {
  // Set page title
  React.useEffect(() => {
    document.title = 'Compare Cars | Auto Korea Kosova Import';
  }, []);
  
  return (
    <main className="flex-grow">
      <CarComparison />
    </main>
  );
}