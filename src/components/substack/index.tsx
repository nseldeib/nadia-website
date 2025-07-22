import React from 'react';
import { Button } from '@/components/ui/button';

const Substack = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">Substack</h2>
      <p className="mt-4 text-lg text-muted-foreground">
        Writing about building, coding, and ideas.
      </p>
      <a href="https://nadia.substack.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
        <Button variant="outline">Read More</Button>
      </a>
    </div>
  );
};

export default Substack;
