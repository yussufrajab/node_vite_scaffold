import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent } from '../components/ui/card.tsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
