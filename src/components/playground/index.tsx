import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Playground = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">Playground</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project X</CardTitle>
            <CardDescription>A fun side project.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Y</CardTitle>
            <CardDescription>Another fun side project.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Z</CardTitle>
            <CardDescription>Yet another fun side project.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Playground;
