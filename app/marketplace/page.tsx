'use client';

import React, { useEffect, useState } from 'react';
import MarketplaceCatalogView from '@/components/marketplace/MarketplaceCatalogView';
import { supabase } from '@/lib/supabaseClient';
import { HoopStore } from '@/lib/store';
import { ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [userId, setUserId] = useState<string>('guest-user');
  const [userName, setUserName] = useState<string>('Atleta Lobo');
  const [userRole, setUserRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const storeUser = HoopStore.getCurrentUser();
        const { data: { user } } = await supabase.auth.getUser();

        const storedRole = typeof window !== 'undefined' ? localStorage.getItem('ww_user_role') : null;
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ww_user_email') : null;
        const storedName = typeof window !== 'undefined' ? localStorage.getItem('ww_student_name') : null;

        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            setUserName(profile.full_name || user.email || 'Miembro de la Manada');
            setUserRole(profile.role || 'student');
          } else {
            setUserName(storedName || user.email || 'Miembro de la Manada');
            setUserRole(storedRole || 'student');
          }
        } else if (storeUser) {
          setUserId(storeUser.id);
          setUserName(storeUser.fullName || 'Atleta Lobo');
          setUserRole(storeUser.role || 'student');
        } else if (storedEmail) {
          setUserId(storedEmail);
          setUserName(storedName || storedEmail.split('@')[0]);
          setUserRole(storedRole || 'student');
        }
      } catch (err) {
        console.error('Error loading user in marketplace:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  return (
    <main className="min-h-screen bg-[#080c15] text-zinc-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Barra superior de navegación / regreso */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Academia
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Comunidad Verificada: <strong className="text-white">{userName}</strong></span>
          </div>
        </div>

        {/* Vista del Catálogo de Bazar Lobo */}
        <MarketplaceCatalogView
          currentUserId={userId}
          currentUserName={userName}
          currentUserRole={userRole}
        />
      </div>
    </main>
  );
}
