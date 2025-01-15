import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BrandsTab from '@/components/settings/BrandsTab'
import TipologiasTab from '@/components/settings/TipologiasTab'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTag, faLayerGroup, faUserGroup, faDatabase, faCloudArrowUp, faHome } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Home Button */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 font-display">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configure your inventory management system preferences
            </p>
          </div>
          <Link 
            href="/"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2.5 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="brands" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-transparent p-0">
            {[
              { value: 'brands', label: 'Marcas', icon: faTag },
              { value: 'tipologias', label: 'Tipologias', icon: faLayerGroup },
              { value: 'user-access', label: 'User Access', icon: faUserGroup },
              { value: 'database', label: 'Database', icon: faDatabase },
              { value: 'backup', label: 'Backup & Restore', icon: faCloudArrowUp },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-transparent px-6 py-4 bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="brands" className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <BrandsTab />
            </div>
          </TabsContent>

          <TabsContent value="tipologias" className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <TipologiasTab />
            </div>
          </TabsContent>

          <TabsContent value="user-access" className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">User Access Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="database" className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Database Settings</h2>
              <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Backup & Restore</h2>
              <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
