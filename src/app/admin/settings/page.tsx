import { db } from '@/lib/fs-db';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function SettingsPage() {
  const currentSettings = await db.settings.get();

  return (
    <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Global Settings</h1>
        <p className="text-gray-500 mb-6">Manage platform fees, text identifiers, and security boundaries.</p>
        
        <SettingsForm initialSettings={currentSettings} />
    </div>
  );
}
