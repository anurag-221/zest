import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/actions/settings-actions';

export default async function SettingsPage() {
  const currentSettingsRes = await getSettings();
  const currentSettings = currentSettingsRes.settings || { platformFee: 0, deliveryFee: 0, handlingFee: 0, freeDeliveryThreshold: 0 };

  return (
    <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Global Settings</h1>
        <p className="text-gray-500 mb-6">Manage platform fees, text identifiers, and security boundaries.</p>
        
        <SettingsForm initialSettings={currentSettings} />
    </div>
  );
}
