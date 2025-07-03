"use client";

import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  return (
    <LayoutApp>
      <h1>Testing All Components</h1>
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Test Label</Label>
          <Input placeholder="Test Input" />
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </LayoutApp>
  );
}