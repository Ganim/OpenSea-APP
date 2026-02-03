/**
 * Settings Page
 * Página de configurações do sistema
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
  Bell,
  Globe,
  Lock,
  Mail,
  Moon,
  Shield,
  Sun,
  Volume2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    sound: false,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações
        </h1>
        <p className="text-lg text-gray-600 dark:text-white/60">
          Personalize sua experiência no sistema
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Aparência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Aparência
                </h2>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Personalize o tema do sistema
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label htmlFor="theme" className="text-base font-medium">
                    Tema Escuro
                  </Label>
                  <Badge variant={theme === 'dark' ? 'default' : 'secondary'}>
                    {theme === 'dark' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <Switch
                  id="theme"
                  checked={theme === 'dark'}
                  onCheckedChange={checked =>
                    setTheme(checked ? 'dark' : 'light')
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notificações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notificações
                </h2>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Gerencie suas preferências de notificações
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <Label
                    htmlFor="email-notif"
                    className="text-base font-medium"
                  >
                    Notificações por Email
                  </Label>
                </div>
                <Switch
                  id="email-notif"
                  checked={notifications.email}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <Label htmlFor="push-notif" className="text-base font-medium">
                    Notificações Push
                  </Label>
                </div>
                <Switch
                  id="push-notif"
                  checked={notifications.push}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <Label
                    htmlFor="desktop-notif"
                    className="text-base font-medium"
                  >
                    Notificações Desktop
                  </Label>
                </div>
                <Switch
                  id="desktop-notif"
                  checked={notifications.desktop}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, desktop: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-500" />
                  <Label
                    htmlFor="sound-notif"
                    className="text-base font-medium"
                  >
                    Som de Notificação
                  </Label>
                </div>
                <Switch
                  id="sound-notif"
                  checked={notifications.sound}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, sound: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Segurança */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 backdrop-blur-xl bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Segurança
                </h2>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  Proteja sua conta
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
              >
                <Lock className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Alterar Senha</p>
                  <p className="text-sm text-gray-600 dark:text-white/60">
                    Última alteração há 3 meses
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
              >
                <Shield className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-gray-600 dark:text-white/60">
                    Adicionar camada extra de segurança
                  </p>
                </div>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
