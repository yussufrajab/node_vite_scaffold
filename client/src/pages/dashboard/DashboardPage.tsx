import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { Button } from '../../components/ui/button.tsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const chartData = [
  { month: 'Jan', users: 65, sessions: 28 },
  { month: 'Feb', users: 59, sessions: 48 },
  { month: 'Mar', users: 80, sessions: 40 },
  { month: 'Apr', users: 81, sessions: 55 },
  { month: 'May', users: 56, sessions: 73 },
  { month: 'Jun', users: 95, sessions: 68 },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });
    setSocketStatus('connecting');
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    return () => { socket.close(); };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-6 h-16">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={socketStatus === 'connected' ? 'default' : 'secondary'}>
                {socketStatus === 'connected' ? '● Live' : '○ Offline'}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            {user?.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user?.name}!</CardTitle>
            <CardDescription>Here's a summary of your activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user?.email}</span> with role <Badge variant="outline">{user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Analytics</CardTitle>
            <CardDescription>Users and sessions over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Users" />
                  <Line type="monotone" dataKey="sessions" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
