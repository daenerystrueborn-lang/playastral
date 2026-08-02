import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';

import { AuthProvider } from '@/contexts/auth-context';
import { TopNav } from '@/components/layout/top-nav';

import { HomePage } from '@/pages/home';
import { PokemonPage } from '@/pages/pokemon';
import { ProfilePage } from '@/pages/profile';
import { ShopPage } from '@/pages/shop';
import { PremiumPage } from '@/pages/premium';
import { BattlesPage } from '@/pages/battles';
import { SeasonsPage } from '@/pages/seasons';
import { SearchPage } from '@/pages/search';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/cards">
        {/* Cards browsing/buying merged into the Shop page — keep old
            /cards links working instead of 404ing. */}
        <Redirect to="/shop" />
      </Route>
      <Route path="/pokemon" component={PokemonPage} />
      <Route path="/battle" component={BattlesPage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/premium" component={PremiumPage} />
      <Route path="/seasons" component={SeasonsPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:id" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <TopNav />
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
